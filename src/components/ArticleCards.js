import React from "react";
import styles from "./ArticleCards.module.css";

function ArticleCards({ article }) {
  return (
    <div className={styles.card}>
      <div className={styles.card_content}>
        <div className={styles.card_icon}>
          <ion-icon name="trending-up-outline"></ion-icon>
          <p className={styles.card_title}>
            {" "}
            {article.title.length > 100
              ? article.title.slice(0, 100) + "..."
              : article.title}{" "}
          </p>
        </div>
        <div className={styles.card_body}>
          <p>
            {" "}
            {article.description.length > 100
              ? article.description.slice(0, 100) + "..."
              : article.description}
          </p>
        </div>
      </div>
      <div className={styles.card_layout}></div>
    </div>
  );
}

export default ArticleCards;
