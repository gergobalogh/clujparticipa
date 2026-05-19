const MAX_DESCRIPTION_LENGTH = 160;

type BuildOgDescriptionInput = {
  description: string;
  title: string;
  category: string;
  district: string;
};

const truncateDescription = (text: string): string => {
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  return text.slice(0, MAX_DESCRIPTION_LENGTH) + "...";
};

const isEmptyOrWhitespace = (text: string): boolean => text.trim().length === 0;

export const buildOgDescription = ({
  description,
  title,
  category,
  district,
}: BuildOgDescriptionInput): string => {
  const baseText = isEmptyOrWhitespace(description) ? title : description;
  const truncated = truncateDescription(baseText);
  return `${truncated} -- ${category}, ${district}`;
};
