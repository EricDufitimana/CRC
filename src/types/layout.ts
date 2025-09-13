export type layout = {
  id: number;
  image:string;
  altText:string;
  title: string;
  description: string;
  hasTwoLinks: boolean;
  links?:{
    text:string;
    href:string;
  }[];

};
