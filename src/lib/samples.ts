export type SampleImage = {
  /** File name inside `public/samples`, also used as the uploaded file name. */
  file: string;
  label: string;
};

/**
 * Example inputs shipped in `public/samples`. Add a PNG there and a matching
 * entry here to offer it in the gallery.
 */
export const SAMPLE_IMAGES: SampleImage[] = [
  { file: "a01-000u-06.png", label: "Sample 1" },
  { file: "a01-007-02.png", label: "Sample 2" },
  { file: "a01-007u-05.png", label: "Sample 3" },
  { file: "r06-018-06.png", label: "Sample 4" },
  { file: "r06-041-08.png", label: "Sample 5" },
  { file: "r06-106-09.png", label: "Sample 6" },
];

export function sampleUrl(sample: SampleImage) {
  return `/samples/${sample.file}`;
}

export async function fetchSampleFile(sample: SampleImage): Promise<File> {
  const response = await fetch(sampleUrl(sample));

  if (!response.ok) {
    throw new Error(`Unable to load ${sample.label} (${response.status}).`);
  }

  const blob = await response.blob();

  return new File([blob], sample.file, {
    type: blob.type || "image/png",
  });
}
