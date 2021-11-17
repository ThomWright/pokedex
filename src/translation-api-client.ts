import got, {Response} from "got"

export type Language = "yoda" | "shakespeare"

const TRANSLATION_API_BASE = "https://api.funtranslations.com/translate"

interface ResponseBody {
  success: {
    total: number
  }
  contents: {
    translated: string
    /** Original */
    text: string
    /** Language */
    translation: string
  }
}

/**
 * @returns The translation for the requested language.
 * @throws For any response other than a 200.
 */
export async function translateText(
  text: string,
  language: Language,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const response = (await got.get(`${TRANSLATION_API_BASE}/${language}`, {
    searchParams: {
      text,
    },
    throwHttpErrors: false,
    responseType: "json",
  })) as Response<ResponseBody>

  if (response.statusCode === 200) {
    return response.body.contents.translated
  }

  throw new Error(
    `Unexpected status code from the Fun Translations API: ${
      response.statusCode
    } ${response.statusMessage ?? ""}`,
  )
}
