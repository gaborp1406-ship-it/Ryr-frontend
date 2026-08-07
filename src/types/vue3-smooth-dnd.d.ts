declare module 'vue3-smooth-dnd' {
  import { DefineComponent } from 'vue';

  export const Container: DefineComponent<{
    groupName?: string;
    behaviour?: 'move' | 'copy' | 'drag-zone';
    orientation?: 'horizontal' | 'vertical';
    dragHandleSelector?: string;
    nonDragAreaSelector?: string;
    dragClass?: string;
    dropClass?: string;
    onDrop?: (dropResult: any) => void;
    getChildPayload?: (index: number) => any;
  }>;

  export const Draggable: DefineComponent<Record<string, any>>;
}
