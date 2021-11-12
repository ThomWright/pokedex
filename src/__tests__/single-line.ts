import {expect} from "chai"
import {onSingleLine} from "../pokemon"

describe("Replacing newline characters", () => {
  ;[
    {name: "Empty", input: "", output: ""},
    {name: "Line feed", input: "Hello\nworld", output: "Hello world"},
    {name: "Windows new line", input: "Hello\r\nworld", output: "Hello world"},
    {
      name: "Multiple newline characters in a row",
      input: "Hello\f\nworld",
      output: "Hello world",
    },
    {
      name: "Form feed",
      input:
        "It was created by a scientist after years of horrific\fgene splicing and DNA engineering experiments.",
      output:
        "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.",
    },
  ].forEach(({name, input, output}) => {
    context(name, () => {
      it("should output text with no newline characters, and only single spaces", () => {
        const actualOutput = onSingleLine(input)
        expect(actualOutput).to.equal(output)
      })
    })
  })

  it("should preserve multiple consecutive space characters", () => {
    const actualOutput = onSingleLine("Hello  world")
    expect(actualOutput).to.equal("Hello  world")
  })
})
