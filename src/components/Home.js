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
        this.checkCacheOrFetch();
      }
    );
  };

  checkCacheOrFetch = () => {
    const currentQuery = `https://newsapi.org/v2/everything?q=${this.state.query}&apiKey=f5984715a9fd4e04bf904d3fb3923869&pageSize=5&page=${this.state.pageNo}`;

    //If an Existing request Exists, Delete it
    if (this.prevRequestToken) {
      this.prevRequestToken.cancel();
      // console.log("cancelled", this.prevRequestToken);
    }

    //checking cached storage
    // const res = JSON.parse(localStorage.getItem[currentQuery]);
    const res = this.cache[currentQuery];
    // console.log("res", res);
    if (res) {
      console.log("cache hit");
      const pagesCount = res.totalResults / 10;
      this.setState({
        ...this.state,
        results: res.articles,
        loading: false,
        pagesCount: Math.ceil(pagesCount),
        disabled: Math.ceil(pagesCount) === this.state.pageNo ? true : false,
      });
      // if not found, make a new request
    } else {
      this.prevRequestToken = axios.CancelToken.source();
      axios
        .get(currentQuery, {
          cancelToken: this.prevRequestToken.token,
        })
        .then((res) => {
          console.log(res.data);
          // store the new response in cache
          // localStorage.setItem(`${currentQuery}`, JSON.stringify(res.data));
          this.cache[currentQuery] = res.data;
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

  //takes user input and displays error message if input size is less than 3 characters
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
            this.checkCacheOrFetch(currentinput);
          }, 1000);
          //waiting for the user to stop typing, to prevent intermediate states
          //from sending requests
          this.setState({ ...this.state, timer: newTimer, errmsg: "" });
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
            this.state.loading ? `${styles.show}` : `${styles.hide}`
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
