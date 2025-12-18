import { isCancel, outro } from "@clack/prompts";
import { styleText } from "util";

export function exitIfCancel(val) {
  if (isCancel(val)) {
    outro(styleText("red", "Exiting"));
    process.exit(0);
  } else {
    return val;
  }
}