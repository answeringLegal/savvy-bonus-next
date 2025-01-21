'use server';

let likes: { [key: string]: number } = {};

export async function addLike(name: string) {
  likes[name] = (likes[name] || 0) + 1;
  return likes[name];
}

export async function getLikes() {
  return likes;
}
