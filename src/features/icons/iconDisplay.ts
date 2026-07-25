export const iconUrl = (pathImage: string) =>
  import.meta.env.DEV ? pathImage : `/any-bingo-tool/${pathImage}`;

export const iconLabel = (pathImage: string) =>
  pathImage.replace(/^icons\/face_/, '').replace(/\.webp$/, '');
