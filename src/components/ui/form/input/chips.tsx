import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { TweenOneGroup } from "rc-tween-one";
import React, { useEffect, useRef, useState } from "react";

import { EIcon } from "@/enums";
import type { ITableItemFilterList } from "@/interfaces";
import { reorderArray } from "@/utils";
import { CButton } from "../../button/index";
import { CSvgIcon } from "../../svg-icon";
import { CIMask, CISelect } from "./index";

/**
 * Component description.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onChange - The callback function triggered when the value changes.
 * @param {string[]} [props.value=[]] - The current value of the component.
 * @param {ITableItemFilterList[]} [props.list] - The list of items for selection.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {boolean} [props.disabled] - Specifies if the component is disabled.
 * @returns {JSX.Element} The rendered component.
 */
const Component = ({
  onChange,
  onBlur,
  value = [],
  list,
  placeholder,
  disabled,
}: {
  onChange?: (values: any[]) => void;
  onBlur?: (values: any[]) => void;
  value?: string[];
  list?: ITableItemFilterList[];
  placeholder: string;
  disabled?: boolean;
}) => {
  /**
   * Toggles the visibility of the input field.
   */
  const [inputVisible, setInputVisible] = useState(false);
  /**
   * A reference to the input element.
   */
  const inputRef = useRef<any>(null);
  useEffect(() => {
    if (inputVisible) {
      setTimeout(() => inputRef.current?.input.focus());
    }
  }, [inputVisible]);

  /**
   * Handles the closing of a tag in the chips input.
   *
   * @param removedTag - The tag that is being removed.
   */
  const handleClose = (removedTag: any) =>
    onChange?.(value.filter((tag) => tag !== removedTag));

  /**
   * Handles the input confirmation for the chips component.
   *
   * @param inputValue - The input value to be confirmed.
   */
  const handleInputConfirm = (inputValue: string | string[]) => {
    if (
      typeof inputValue === "string" &&
      inputValue &&
      !value.includes(inputValue)
    ) {
      onChange?.([...value, inputValue]);
    } else if (typeof inputValue === "object") {
      onChange?.([...value, ...inputValue.filter((i) => !value.includes(i))]);
    }

    if (!list) {
      setInputVisible(false);
    }
  };

  /**
   * Handles the drag end event for the chips component.
   *
   * @param event - The drag end event.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange?.(reorderArray(value, oldIndex, newIndex));
    }
  };

  /**
   * Initializes the sensors for the chips input component.
   *
   * @param sensors - The sensors used for handling user interactions.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /**
   * Renders the input component based on the condition.
   * If `list` is falsy, it renders a CIMask component with the provided props.
   * If `list` is truthy, it renders a CISelect component with the provided props.
   *
   * @returns The rendered input component.
   */
  const renderEntry = list ? (
    <CISelect
      onChange={(value: any) => handleInputConfirm(value)}
      onBlur={(value) => {
        setInputVisible(false);
        onBlur?.(value);
      }}
      disabled={!!disabled}
      isMultiple={true}
      list={list.filter((i) => i.value && !value.includes(i.value.toString()))}
    />
  ) : (
    <CIMask
      ref={inputRef}
      onBlur={onBlur}
      placeholder={placeholder}
      onPressEnter={() => handleInputConfirm(inputRef.current?.input.value)}
      disabled={!!disabled}
    />
  );

  /**
   * Handles the end event.
   * @param {Event} e - The event object.
   */
  const handleEnd = (e: any) => {
    if (e.type === "appear" || e.type === "enter") {
      e.target.style = "display: inline-block";
    }
  };

  /**
   * Renders the tags based on the provided value.
   *
   * @returns The rendered tags as JSX elements.
   */
  const renderTag = () =>
    value.map((tag) => (
      <DraggableTag
        disabled={!!disabled}
        tag={tag}
        key={tag}
        list={list}
        onClose={(e: any) => {
          e.preventDefault();
          handleClose(tag);
        }}
      />
    ));
  /**
   * Renders the toggle for the input chips.
   *
   * @returns The JSX element representing the toggle.
   */
  const renderToggle = () =>
    inputVisible ? (
      renderEntry
    ) : (
      <CButton
        icon={<CSvgIcon name={EIcon.plus} size={32} className="p-2" />}
        className="inline-block rounded-full border"
        onClick={() => setInputVisible(true)}
        disabled={disabled}
      />
    );

  return (
    <TweenOneGroup
      appear={false}
      enter={{ scale: 0.8, opacity: 0, type: "from", duration: 100 }}
      leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
      onEnd={handleEnd}
      className={"flex flex-wrap gap-2.5 py-2"}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <SortableContext items={value} strategy={horizontalListSortingStrategy}>
          {renderTag()}
          {renderToggle()}
        </SortableContext>
      </DndContext>
    </TweenOneGroup>
  );
};
export default Component;
/**
 * DraggableTag component represents a draggable tag element.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.tag - The tag value.
 * @param {React.MouseEventHandler<HTMLButtonElement>} props.onClose - The event handler for closing the tag.
 * @param {boolean} props.disabled - Indicates whether the tag is disabled or not.
 * @param {ITableItemFilterList[]} [props.list] - The list of table item filter objects.
 * @returns {JSX.Element} The rendered DraggableTag component.
 */
const DraggableTag = ({
  tag,
  onClose,
  disabled,
  list,
}: {
  tag: string;
  onClose: React.MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
  list?: ITableItemFilterList[];
}) => {
  const { listeners, transform, transition, isDragging, setNodeRef } =
    useSortable({ id: tag });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? "unset" : transition,
      }
    : {};

  return (
    <div
      className="relative inline-block cursor-move rounded-xl border bg-primary/20 px-2 py-1.5"
      style={style}
      ref={setNodeRef}
      {...listeners}
    >
      <CButton
        icon={<CSvgIcon name={EIcon.times} size={16} className="p-1" />}
        className="absolute -right-2 -top-1.5 rounded-full"
        onClick={onClose}
        disabled={disabled}
      />
      {list ? list.find((i) => i.value === tag)?.label : tag}
    </div>
  );
};
