import React from "react";
import axios from "axios";
import Loader from "../loader.svg";
import ArticleCards from "./ArticleCards";
import Error from "./Error";
import styles from "./Home.module.css";

class Home extends React.Component {
  constructor(props) {
    super(props);
    localStorage.clear();
    this.state = {
      query: "",
      results: {},
      loading: false,
      errmsg: "",
      response: 0,
      pagesCount: 0,
      pageNo: 1,
      timer: 0,
      disabled: true,
    };
    this.prevRequestToken = "";
    this.cache = {};
  }

  showNextPage = () => {
    // console.log("showNextPage", this.query);
    this.setState(
      { ...this.state, pageNo: this.state.pageNo + 1, loading: true },
      () => {
        this.fetchSearchResults();
      }
    );
  };

  fetchSearchResults = () => {
    const searchUrl = `https://newsapi.org/v2/everything?q=${this.state.query}&apiKey=f5984715a9fd4e04bf904d3fb3923869&pageSize=5&page=${this.state.pageNo}`;

    if (this.prevRequestToken) {
      //If an Existing request Exists, Delete it
      this.prevRequestToken.cancel();
      console.log("cancelled", this.prevRequestToken);
      // return;
    }

    const res = localStorage.getItem[searchUrl];
    if (res) {
      console.log("cache hit");
      const pagesCount = res.data.totalResults / 10;
      this.setState({
        ...this.state,
        results: res.data.articles,
        loading: false,
        pagesCount: Math.ceil(pagesCount),
        disabled: Math.ceil(pagesCount) === this.state.pageNo ? true : false,
      });
      // return;
    } else {
      this.prevRequestToken = axios.CancelToken.source();
      axios
        .get(searchUrl, {
          cancelToken: this.prevRequestToken.token,
        })
        .then((res) => {
          console.log(res.data);
          // this.cache[searchUrl] = res;
          localStorage.setItem(`${searchUrl}`, JSON.stringify(res));
          const pagesCount = res.data.totalResults / 10;
          this.setState({
            ...this.state,
            results: res.data.articles,
            loading: false,
            errmsg: "",
            pagesCount: Math.ceil(pagesCount),
            disabled:
              Math.ceil(pagesCount) === this.state.pageNo ? true : false,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            ...this.state,
            loading: false,
            errmsg: "Update API key or check network",
          });
        });
    }
  };

  userinput = (event) => {
    let currentinput = event.target.value;
    if (currentinput.length >= 3) {
      this.setState(
        {
          ...this.state,
          query: currentinput,
          loading: true,
          errmsg: "",
          pageNo: 1,
        },
        () => {
          // We reach this statement only if the input is longer than 3 characters
          // and we have set the state to loading
          clearTimeout(this.timer);
          const newTimer = setTimeout(() => {
            this.fetchSearchResults(currentinput);
          }, 1000);
          this.setState({ ...this.state, timer: newTimer });
        }
      );
    } else {
      this.setState({
        ...this.state,
        query: currentinput,
        loading: false,
        errmsg: "Search Query Should be atleast 3 Characters long",
        results: {},
        pageNo: 1,
      });
    }
  };

  renderSearchResults = () => {
    const { results } = this.state;
    if (Object.keys(results).length && results.length) {
      return (
        <div className={styles.results_container}>
          {results.map((result) => {
            return (
              <a
                key={result.id}
                href={result.previewURL}
                className={styles.result_items}
              >
                <h6 className={styles.image_username}>{result.user}</h6>
                <div className={styles.image_wrapper}>
                  <img
                    className={styles.image}
                    src={result.previewURL}
                    alt={result.user}
                  />
                </div>
              </a>
            );
          })}
        </div>
      );
    }
  };

  render() {
    return (
      <div className={styles.search}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <input
              type="text"
              value={this.query}
              id="search-input"
              placeholder="Type to Search"
              onChange={this.userinput}
            />
          </div>
        </div>

        <img
          src={Loader}
          className={`${styles.loading} ${
            this.cacheloading ? `${styles.show}` : `${styles.hide}`
          }`}
          alt="loader"
        />

        <div className={styles.cards}>
          {this.state.results.length &&
            this.state.results.map((article) => (
              <ArticleCards article={article} />
            ))}
        </div>

        {this.state.errmsg.length > 0 ? (
          <Error errmsg={this.state.errmsg} />
        ) : (
          true
        )}

        {!this.state.disabled && this.state.results.length === 5 && (
          <div className={styles.next} onClick={this.showNextPage}>
            {" "}
            Next Page
          </div>
        )}
      </div>
    );
  }
}
export default Home;
