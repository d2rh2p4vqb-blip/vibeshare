export function computeHotScore(likeCount: number, commentCount: number, favoriteCount: number, viewCount: number): number {
  return likeCount * 2 + commentCount * 3 + favoriteCount * 5 + viewCount * 0.1;
}
