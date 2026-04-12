import { api } from "../Api/Axios"

interface SubmitCodeParams {
  sourceCode: string
  languageId: number
  stdin?:     string
}

export interface CodeResult {
  status: string
  output: string
  error:  string
  time:   string
  memory: string
}

export const submitCode = async ({
  sourceCode,
  languageId,
  stdin = ""
}: SubmitCodeParams): Promise<CodeResult> => {

  const res = await api.post("/code/run", {
    sourceCode,
    languageId,
    stdin
  })

  return res.data as CodeResult
}