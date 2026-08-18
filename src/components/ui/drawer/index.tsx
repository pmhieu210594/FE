import type { AnyFormApi } from "@tanstack/react-form";
import { Drawer } from "antd";
import { type ReactNode, useRef } from "react";

import type { IForm } from "@/interfaces";
import { CButton } from "../button";
import { CForm } from "../form";

type CDrawerFormProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  columns: IForm[];
  values?: any;
  isLoading?: boolean;
  showSubmit?: boolean;
  textSubmit?: string;
  textCancel?: string;
  width?: number;
  onClose: () => void;
  onSubmit: (props: { value: any; formApi: AnyFormApi }) => any;
  children?: ReactNode;
};

export const CDrawerForm = ({
  open,
  title,
  description,
  columns,
  values = {},
  isLoading = false,
  showSubmit = true,
  textSubmit = "Save",
  textCancel = "Cancel",
  width = 640,
  onClose,
  onSubmit,
  children,
}: CDrawerFormProps) => {
  const formRef = useRef<AnyFormApi | null>(null);

  return (
    <Drawer
      rootClassName="cdrawer-form"
      open={open}
      placement="right"
      size={width}
      onClose={onClose}
      closable={false}
      maskClosable={false}
      destroyOnHidden
      title={
        <div className="space-y-1">
          <div
            className="cdrawer-form__title font-semibold leading-none tracking-tight"
            style={{ fontSize: 18 }}
          >
            {title}
          </div>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-4 pr-4">
          <CButton
            text={textCancel}
            onClick={onClose}
            className="h-11 px-6 !border-input !bg-background !text-foreground hover:!bg-muted"
          />
          {showSubmit ? (
            <CButton
              text={textSubmit}
              onClick={() => formRef.current?.handleSubmit()}
              className="h-11 px-7 !bg-primary text-primary-foreground"
              isLoading={isLoading}
            />
          ) : null}
        </div>
      }
      styles={{
        body: { padding: 24 },
        footer: { borderTop: "1px solid hsl(var(--border))", padding: 16 },
      }}
    >
      <CForm
        ref={formRef}
        columns={columns}
        values={values}
        isEnterSubmit
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
      {children ? <div className="mt-4">{children}</div> : null}
    </Drawer>
  );
};
