export default function arrayAsOptions(array) {
  return array?.map((elem) => {
    return { value: elem.id, label: elem.name };
  });
}
