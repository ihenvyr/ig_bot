const express = require("express");
const fetch = require("isomorphic-unfetch");
const { createApi } = require("instamancer");
const { checkStatus } = require("./utils/fetch");
const { formatPost } = require("./utils/json");

const options = {
  total: 3,
  silent: false,
  fullAPI: false,
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
* GET USER DETAILS
* */
app.get("/user/:username", async (req, res) => {
  fetch(`https://www.instagram.com/${req.params.username}/?__a=1`)
    .then(checkStatus)
    .then(result => {
      res.json({
        id: result.graphql.user.id,
        username: result.graphql.user.username,
        full_name: result.graphql.user.full_name,
        posts: result.graphql.user.edge_owner_to_timeline_media.count,
        following: result.graphql.user.edge_follow.count,
        followers: result.graphql.user.edge_followed_by.count,
      });
    })
    .catch(error => {
      console.log(error);
      res.json({});
    });
});

/*
* GET USER POSTS
* */
app.get("/user/:username/posts/:total?", async (req, res) => {
  const response = [];

  try {
    const user = createApi("user", req.params.username, { ...options, total: req.params.total || 5 });

    for await (const post of user.generator()) {
      // console.log(`USER >>> timestamp: ${new Date(post.node.taken_at_timestamp * 1000)}\n`);
      // console.log(post);
      response.push(formatPost(post));
    }

    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});

/*
* GET HASHTAG DETAILS
* */
app.get("/hashtag/:hashtag", async (req, res) => {
  fetch(`https://www.instagram.com/explore/tags/${req.params.hashtag}/?__a=1`)
    .then(checkStatus)
    .then(result => {
      res.json({
        id: result.graphql.hashtag.id,
        name: result.graphql.hashtag.name,
        posts: result.graphql.hashtag.edge_hashtag_to_media.count,
        related_hashtags: result.graphql.hashtag.edge_hashtag_to_related_tags.edges.map(edge => edge.node.name),
      });
    })
    .catch(error => {
      console.log(error);
      res.json({});
    });
});

/*
* GET HASHTAG POSTS
* */
app.get("/hashtag/:hashtag/posts/:total?", async (req, res) => {
  const response = [];

  try {
    const hashtag = createApi("hashtag", req.params.hashtag, { ...options, total: req.params.total || 5 });
    for await (const post of hashtag.generator()) {
      // console.log(`HASHTAG >>> timestamp: ${new Date(post.node.taken_at_timestamp * 1000)}\n`);
      // console.log(post);
      response.push(formatPost(post));
    }

    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});

const port = 8000;
app.listen(port, () => console.log(`Server is running in port ${port}`));

/*(async () => {
  let result;

  const search_user = createApi("search", "@ihenvyr", options);
  result = await search_user.get();
  const user_data = result.users.filter(data => data.user.username === "ihenvyr")[0];
  console.log("user_data >>>", user_data);

  const search_hashtag = createApi("search", "#smm", options);
  result = await search_hashtag.get();
  const hashtag_data = result.hashtags.filter(data => data.hashtag.name === "smm")[0];
  console.log("hashtag_data >>>", hashtag_data);
})();*/
