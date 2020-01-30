const twitter = require("twitter-text");
exports.formatPost = (post) => {
  return {
    link: `https://www.instagram.com/p/${post.node.shortcode}/`,
    likes: post.node.edge_media_preview_like.count,
    comments: post.node.edge_media_to_comment.count,
    caption: post.node.edge_media_to_caption.edges.map((data) => data.node.text),
    hashtags_from_caption: twitter.extractHashtags(post.node.edge_media_to_caption.edges.map((data) => data.node.text).join(", ")),
  };
};