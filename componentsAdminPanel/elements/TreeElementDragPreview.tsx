import React from "react";
import { DragLayerMonitorProps } from "@minoru/react-dnd-treeview";
import styles from "@/styles/TreeElementDragPreview.module.css";

type Props = {
  monitorProps: DragLayerMonitorProps<any>;
};

export const TreeElementDragPreview: React.FC<Props> = (props) => {
  const item = props.monitorProps.item;

  return <div className={styles.root}>{item.text}</div>;
};
