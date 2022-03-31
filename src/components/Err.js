import React from "react";
import styles from "./Error.module.css";
function Err({ errmsg }) {
  return <div className={styles.error}>{errmsg}</div>;
}

export default Err;
