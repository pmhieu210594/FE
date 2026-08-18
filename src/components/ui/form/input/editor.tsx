import { API, uuidv4 } from "@/utils";
import { useEffect, useRef } from "react";

/**
 * Component for rendering an editor input field.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onChange - The callback function to handle value changes.
 * @param {string} props.value - The initial value of the input field.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @returns {JSX.Element} The rendered editor input field.
 */
const Component = ({
  onChange,
  onBlur,
  value = "",
  placeholder,
  id,
  buttonList,
}: {
  onChange?: (values: string) => void;
  onBlur?: (e: any) => any;
  value?: string;
  placeholder: string;
  id?: string;
  buttonList?: any[][];
}) => {
  /**
   * Unique identifier for the input editor.
   */
  const _id = useRef(id || uuidv4());
  useEffect(() => {
    setTimeout(() => {
      /**
       * Creates a SunEditor instance with the specified options.
       *
       * @param {HTMLElement} element - The HTML element to attach the editor to.
       * @param {object} options - The options for configuring the editor.
       * @returns {SunEditor} The created SunEditor instance.
       */
      const defaultButtonList = [
        ["undo", "redo"],
        ["font", "fontSize", "formatBlock"],
        ["paragraphStyle", "blockquote"],
        ["bold", "underline", "italic", "strike", "subscript", "superscript"],
        ["fontColor", "hiliteColor", "textStyle"],
        ["removeFormat"],
        ["outdent", "indent"],
        ["align", "horizontalRule", "list", "lineHeight"],
        ["table", "link", "image", "video", "audio"],
        ["fullScreen", "showBlocks", "codeView"],
      ];
      const editor = SUNEDITOR.create(document.getElementById(_id.current), {
        value,
        placeholder,
        width: "auto",
        height: "auto",
        fontSize: [11, 13, 16, 18, 20, 24, 30, 36, 48, 60, 72, 96, 128],
        buttonList: buttonList ?? defaultButtonList,
      });
      editor.onChange = onChange;
      editor.onFocus = (_: string, core: any) =>
        onChange?.(core.context.element.wysiwyg.innerHTML);
      editor.onBlur = (_: string, core: any) =>
        onBlur?.(core.context.element.wysiwyg.innerHTML);
      editor.onImageUploadBefore = (
        files: any,
        _: any,
        __: any,
        uploadHandler: any,
      ) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", files[0]);
        handleImageUpload(bodyFormData, files, uploadHandler);
        return false;
      };
    });
  }, []);
  return <div id={_id.current} />;
};

const handleImageUpload = (
  bodyFormData: FormData,
  files: any,
  uploadHandler: any,
) => {
  API.post<{ path: string }>({
    url: `/files`,
    values: bodyFormData,
    showMessage: false,
  }).then(({ data }) => {
    uploadHandler({
      result: [
        {
          url: data?.path,
          name: files[0].name,
          size: files[0].size,
        },
      ],
    });
  });
};

export default Component;
