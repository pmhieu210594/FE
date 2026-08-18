import { Popconfirm, Spin } from "antd";
import classNames from "classnames";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { EIcon } from "@/enums";
import { message } from "@/router-message";
import { API, arrayMove, handleGetBase64, KEY_TOKEN, uuidv4 } from "@/utils";
import { CButton } from "../button";
import { CSvgIcon } from "../svg-icon";

/**
 * Component for uploading files.
 *
 * @component
 * @example
 * ```tsx
 * <CUpload
 *   value={[]}
 *   onChange={(values: any[]) => {}}
 *   deleteFile={null}
 *   showBtnDelete={() => true}
 *   method="post"
 *   maxSize={40}
 *   isMultiple={true}
 *   action="/files"
 *   keyImage="path"
 *   accept="image/*"
 *   validation={async (file: any, listFiles: any) => true}
 * />
 * ```
 */
export const CUpload = ({
  value = [],
  onChange,
  deleteFile,
  showBtnDelete = () => true,
  method = "post",
  maxSize = 40,
  isMultiple = true,
  action = "/files",
  keyImage = "path",
  accept = "image/*",
  validation = async () => true,
}: PropsWithChildren<{
  value?: any[];
  onChange?: (values: any[]) => any;
  deleteFile?: any;
  showBtnDelete?: (file: any) => boolean;
  method?: string;
  maxSize?: number;
  isMultiple?: boolean;
  action?: string | ((file: any, config: any) => any);
  keyImage?: string;
  accept?: string;
  validation?: (file: any, listFiles: any) => Promise<boolean>;
}>) => {
  /**
   * Retrieves the translation function from the specified locale and sets the key prefix to 'Library'.
   *
   * @returns The translation function.
   */
  const { t } = useTranslation("locale", { keyPrefix: "Components" });
  /**
   * A reference to indicate whether the component is currently loading.
   */
  const isLoading = useRef(false);
  /**
   * A reference to the component.
   */
  const ref = useRef<any>();
  /**
   * Represents the state of the list of files.
   */
  const [listFiles, setListFiles] = useState<any>([]);
  useEffect(() => {
    let tempData: any = typeof value === "string" ? [value] : [];
    if (value && typeof value === "object") {
      tempData = value.map((_item: any) => {
        if (_item.status) return _item;
        return {
          ..._item,
          status: "done",
        };
      });
    }

    if (
      JSON.stringify(listFiles) !== JSON.stringify(tempData) &&
      listFiles.filter((item: any) => item.status === "uploading").length === 0
    ) {
      setListFiles(tempData);
      setTimeout(() => GLightbox({}), 100);
    }
  }, [value, isMultiple]);

  useEffect(() => {
    setTimeout(() => GLightbox({}), 100);
  }, []);

  /**
   * Handles the upload of files.
   *
   * @param target - The target element containing the uploaded files.
   * @returns void
   */
  const onUpload = async ({ target }: any) => {
    for (const file of target.files) {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        message.error(
          `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)}mb): ${t(
            "YouCanOnlyUploadUpToMB",
            {
              max: maxSize,
            },
          )}`,
        );
      }

      if (
        (maxSize && file.size > maxSize * 1024 * 1024) ||
        !(await validation(file, listFiles))
      ) {
        return setListFiles(
          listFiles.filter((_item: any) => _item.id !== dataFile.id),
        );
      }
      /**
       * Retrieves the base64 representation of the given file.
       *
       * @param {File} file - The file to retrieve the base64 representation for.
       * @returns {string} The base64 representation of the file.
       */
      const thumbUrl = handleGetBase64(file);
      /**
       * Represents a file data object.
       *
       * @property {number} lastModified - The last modified timestamp of the file.
       * @property {Date} lastModifiedDate - The last modified date of the file.
       * @property {string} name - The name of the file.
       * @property {number} size - The size of the file in bytes.
       * @property {string} type - The MIME type of the file.
       * @property {File} originFileObj - The original File object.
       * @property {string} thumbUrl - The URL of the thumbnail image.
       * @property {string} id - The unique identifier of the file.
       * @property {number} percent - The upload progress percentage.
       * @property {string} status - The upload status of the file.
       */
      const dataFile = {
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file,
        thumbUrl,
        id: uuidv4(),
        percent: 0,
        status: "uploading",
      };
      if (isMultiple) {
        listFiles.push(dataFile);
      } else {
        listFiles[0] = dataFile;
      }
      isLoading.current = true;
      setListFiles([...listFiles]);

      if (typeof action === "string") {
        /**
         * FormData object used for sending data in HTTP requests.
         */
        const bodyFormData = new FormData();
        bodyFormData.append("file", file);
        const { data } = await API.responsible<any>({
          url: action,
          config: {
            ...API.init(),
            method,
            body: bodyFormData,
            headers: {
              authorization:
                "Bearer " + (localStorage.getItem(KEY_TOKEN) ?? ""),
              "Accept-Language": localStorage.getItem("i18nextLng") ?? "",
            },
          },
        });

        formatData({ data, dataFile });
      }
      setTimeout(() => GLightbox({}), 100);
    }
    ref.current.value = "";
  };

  /**
   * Formats the data and updates the list of files.
   *
   * @param data - The data to be formatted.
   * @param dataFile - The file data object.
   */
  const formatData = async ({
    data,
    dataFile,
  }: {
    data: any;
    dataFile: {
      lastModified: any;
      lastModifiedDate: any;
      name: any;
      size: any;
      type: any;
      originFileObj: any;
      thumbUrl: unknown;
      id: string;
      percent: number;
      status: string;
    };
  }) => {
    if (data) {
      /**
       * Updates the files array based on the given data and file ID.
       * If isMultiple is true, it updates the corresponding file in the listFiles array.
       * If isMultiple is false, it replaces the files array with a new array containing the given data.
       *
       * @param {boolean} isMultiple - Indicates whether multiple files can be uploaded.
       * @param {Array} listFiles - The array of files.
       * @param {object} dataFile - The file object to be updated.
       * @param {object} data - The new data to be assigned to the file object.
       * @returns {Array} - The updated files array.
       */
      const files = isMultiple
        ? listFiles.map((item: any) => {
            if (item.id === dataFile.id) {
              item = { ...item, ...data, status: "done" };
            }
            return item;
          })
        : [{ ...data, status: "done" }];
      isLoading.current = false;
      setListFiles(files);
      if (onChange) {
        await onChange(files);
      }
    } else {
      isLoading.current = false;
      setListFiles(listFiles.filter((_item: any) => _item.id !== dataFile.id));
    }
  };
  /**
   * Moves an image within the list of files.
   *
   * @param index - The index of the image to be moved.
   * @param new_index - The new index where the image should be moved to.
   * @returns Promise<void> - A promise that resolves when the image has been moved.
   */
  const moverImage = async (index: number, new_index: number) => {
    if (isMultiple) {
      const files = arrayMove(listFiles, index, new_index);
      setListFiles(files);
      if (onChange) {
        await onChange(files);
      }
    }
  };

  /**
   * Renders an arrow up button for the given index.
   *
   * @param index - The index of the button.
   * @returns The arrow up button component.
   */
  const renderArrowUp = (index: number) =>
    index > 0 && (
      <button
        type="button"
        onClick={() => moverImage(index, index - 1)}
        className={
          "absolute right-1 top-1 size-5 cursor-pointer rounded-full bg-base-200 text-base-content transition-all duration-300 hover:bg-primary"
        }
      >
        <CSvgIcon
          name={EIcon.arrow}
          size={12}
          className={"m-1 rotate-180 fill-primary hover:fill-base-content"}
        />
      </button>
    );

  /**
   * Renders an arrow down button for the given index.
   *
   * @param index - The index of the button.
   * @returns The arrow down button JSX element.
   */
  const renderArrowDown = (index: number) =>
    index < listFiles.length - 1 && (
      <button
        type="button"
        onClick={() => moverImage(index, index + 1)}
        className={classNames(
          "absolute right-1 size-5 cursor-pointer rounded-full bg-base-200 text-base-content transition-all duration-300 hover:bg-primary",
          {
            "top-8": index > 0,
            "top-1": index === 0,
          },
        )}
      >
        <CSvgIcon
          name={EIcon.arrow}
          size={12}
          className={"m-1 fill-primary hover:fill-base-content"}
        />
      </button>
    );

  /**
   * Renders a delete button for a file.
   *
   * @param file - The file object.
   * @param index - The index of the file in the list.
   * @returns The delete button component.
   */
  const renderBtnDelete = (file: any, index: number) =>
    showBtnDelete(file) && (
      <Popconfirm
        title={t("AreYouSureWantDelete", {
          name: file.name,
          label: t("File").toLowerCase(),
        })}
        onConfirm={async () => {
          if (deleteFile && file?.id) {
            const data = await deleteFile(file?.id);
            if (!data) {
              return false;
            }
          }
          onChange?.(listFiles.filter((_item: any) => _item.id !== file.id));
        }}
      >
        <button
          type="button"
          className={classNames("btn-delete", {
            "top-16":
              listFiles.length > 1 && index > 0 && index < listFiles.length - 1,
            "top-8":
              listFiles.length > 1 &&
              (index === 0 || index === listFiles.length - 1),
            "top-1": listFiles.length === 1,
          })}
        >
          <CSvgIcon
            name={EIcon.times}
            size={12}
            className={"m-1 fill-error hover:fill-base-content"}
          />
        </button>
      </Popconfirm>
    );
  /**
   * Handles the paste event and uploads any files from the clipboard.
   *
   * @param {ClipboardEvent} event - The paste event.
   * @returns {Promise<void>} - A promise that resolves when the upload is complete.
   */
  const handlePaste = async (event: any) => {
    /**
     * Retrieves the items from the clipboard data.
     *
     * @param {ClipboardEvent['clipboardData']['items']} items - The items from the clipboard data.
     */
    const items = event.clipboardData.items;
    for (const index in items) {
      const item = items[index];
      if (item.kind === "file") {
        const blob = item.getAsFile();
        await onUpload({ target: { files: [blob] } });
      }
    }
  };

  /**
   * Renders a list of files as a series of div elements.
   *
   * @param listFiles - The array of files to render.
   * @returns The rendered list of files.
   */
  const renderListFiles = listFiles.map((file: any, index: number) => (
    <div key={"file-" + index} className={"relative"}>
      <a href={file[keyImage] ? file[keyImage] : file} className="glightbox">
        <img src={file[keyImage] ? file[keyImage] : file} alt={file.name} />
      </a>
      {renderArrowUp(index)}
      {renderArrowDown(index)}
      {renderBtnDelete(file, index)}
    </div>
  ));

  return (
    <Spin spinning={isLoading.current}>
      <input
        type="file"
        className={"hidden"}
        accept={accept}
        multiple={isMultiple}
        ref={ref}
        onChange={onUpload}
      />
      <div
        className={classNames("upload", {
          "upload-grid": isMultiple,
          "w-24": !isMultiple,
        })}
      >
        {renderListFiles}
      </div>
      <div className={"mt-2 flex gap-2"}>
        <CButton
          isTiny={true}
          onClick={() => ref.current.click()}
          icon={<CSvgIcon name={EIcon.upload} size={16} />}
          text={"Upload"}
        />
        <CButton
          isTiny={true}
          icon={<CSvgIcon name={EIcon.paste} size={16} />}
          text={"Paste"}
          onPaste={handlePaste}
        ></CButton>
      </div>
    </Spin>
  );
};
