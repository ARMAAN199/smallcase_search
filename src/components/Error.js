import React from "react";
import styles from "./Error.module.css";
function Error({ errmsg }) {
  return <div className={styles.error}>{errmsg}</div>;
}

export default Error;
