import type {Feature} from "@application/feature/definition";
import {wideLayout} from "@features/wide-layout/index";

/** 設定画面にはこの順に表示する。 */
export const features: readonly Feature[] = [wideLayout];
