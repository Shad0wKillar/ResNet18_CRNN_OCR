# ResNet18-CRNN-OCR

Next.js frontend for the OCR inference Space at:

```txt
https://shad0wkillar-ocr.hf.space/predict
```

## Run locally

```bash
pnpm install
pnpm dev
```

The app posts images to `/api/predict`, and that route forwards the file to the Hugging Face Space. You can override the endpoint with:

```bash
HF_OCR_ENDPOINT="https://your-space.hf.space/predict" pnpm dev
```
