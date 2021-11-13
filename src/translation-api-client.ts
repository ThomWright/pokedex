import got from "got"

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

export async function translateText(
  text: string,
  language: Language,
): Promise<string> {
  const responseBody: ResponseBody = await got
    .get(`${TRANSLATION_API_BASE}/${language}`, {
      searchParams: {
        text,
      },
      throwHttpErrors: true,
    })
    .json()

  console.log(responseBody)

  return responseBody.contents.translated
}
