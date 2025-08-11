<!--
  This document is derived from the Material Design 3 guidelines "UX Writing Best Practices" (https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices). All Material Design 3 content, guidelines, imagery, and resources are made available under the Apache 2.0 or Creative Commons Attribution 4.0 (CC BY 4.0) license; see https://m3.material.io/get-started for license details. Please refer to the original source for the most up-to-date guidance.
-->

## UX writing best practice[^1]

### Explain consequences

Emphasize the results of the user’s potential action in neutral, direct language. Avoid cautions or warnings that might sound alarming, intimidating, or condescending. Focus instead on communicating the consequences of a function.

- Do
  - Tell users what will happen if they take an action and how they can undo it
- Don't
  - Don’t misrepresent consequences or try to influence a user’s decision

### Use scannable words and formats

People scan UI text in search of the most meaningful content to them. Help by using specific titles and headings that clearly describe a topic. When users are skimming or hurrying through an action, this organization helps them avoid mistakes and unintentional actions.

- Do
  - Use headings and subheads to prioritize and group information

### Use sentence case

Unless otherwise specified, use sentence-style capitalization, where only the first letter of the first word in a sentence or phrase is capitalized. All text, including titles, headings, labels, menu items, navigation components, app bars, and buttons should use sentence-style capitalization. Products and branded terms may also be capitalized.

- Do
  - Capitalize the first word of a sentence or phrase
- Don't
  - Don’t use title case capitalization. Instead, use sentence case.

### Use abbreviations sparingly

Spell out words whenever possible. Shortened forms of words can be difficult for people to understand and screen readers to read. Avoid Latin abbreviations in UI text such as e.g. or etc. Instead, use full phrases like "for example," or "and more."

- Do
  - When an abbreviation is appropriate, make sure it’s formatted and spelled correctly to avoid confusion
- Don't
  - Avoid using abbreviations when there’s space to spell out a word

## Word choice

### Use second person pronouns ("you")

Use the second-person pronouns “you” and “your” to help the user to feel like the UI is talking to them and referring to their actions

- Do
  - Write from the user’s point of view to help them take action
- Don't
  - Avoid writing that sounds impersonal and robotic

### Don’t combine first and second person

Avoid mixing "me" or "my" with "you" or "your.” It can cause confusion to see both forms of address in the same context.

- Do
  - Write from a user’s point of view by emphasizing their perspective with “you” and “your”
- Don't
  - Don’t mix different forms of address in the same screen. Instead, use “you” and “your” or get rid of the pronoun.

### Use caution with “I” and “we”

When written on behalf of a large, global company like Google, “we” or “I” may come across as robotic or disconcerting.

Focus on the user’s point of view, rather than Google’s, and consider if it’s possible to rewrite a phrase without “we.”

- Don't
  - Don’t use first person pronouns to speak for the voice of Google
- Don't
  - Avoid using first person pronouns. Write from the user’s point of view by using second person pronouns or removing pronouns altogether.

Some legal texts may merit an exception: “I” or “my” (the first person) emphasizes ownership in agreements or acknowledgments. For example, “I agree to the terms of service.”

- Do
  - First person pronouns can help users understand when they’re making impactful decisions
- Caution
  - Use caution with “we” or “our.” Even when these pronouns represent real people employed by Google, seeing first person pronouns in UI text can be confusing or jarring.

## Grammar and punctuation

### Skip periods and unnecessary punctuation

To help readers scan text, avoid using periods and other unnecessary punctuation.

Avoid using periods to end single sentences, particularly in:

- Labels
- Tooltip text
- Bulleted lists
- Dialog body text
- Hyperlinked text

Use periods on:

- Multiple sentences
- Long or complex sentences, if it suits the context

- Do
  - Omit punctuation on single-line sentences
- Don't
  - Avoid using periods to end single sentences

### Use contractions

Contractions can make a sentence easier to understand and scan.

However, sometimes "do not" can give more emphasis than "don't” when caution is needed.

- Do
  - Avoid spelling out words that can be contractions
- Don't
  - Phrases that aren’t contracted can feel stiff or overly formal

### Use serial commas

Use the serial (or Oxford) comma, except before an ampersand.

Always place commas inside quotation marks.

- Do
  - Use a serial comma in lists of three or more items
- Don't
  - Don’t skip serial commas before “and”

### Use commas for numbers between 1,000 and 1 million

Use commas for numbers over 1,000. Don’t use commas when identifying something, such as a:

- Street address
- Radio frequency
- Year

For numbers over 1 million, comma use depends on context. “Million” can be abbreviated with with “M” and the value can be rounded when the intent is to give people a sense of the volume, rather than the exact numbers.

- Do
  - Abbreviate “million” with “M” and don’t use commas when giving people a sense of volume
- Don't
  - Use commas in numbers between 1,000 and 1 million

### Skip colons in headings

For headings on lists of items, do not use colons. For lists within body text, use a colon.

### Use exclamation points sparingly

Exclamation points can come across as shouting or overly friendly. Some exceptions include greetings or congratulatory messages.

- Do
  - Exclamation marks can be used to emphasize celebratory moments
- Don't
  - Avoid using exclamation marks for empty states and common tasks. Save it for bigger accomplishments.

### Use ellipses sparingly

Use ellipses to indicate an action in progress or incomplete text. Truncated text may appear with ellipses, but check with your engineering partners before implementing, as this often happens automatically.

Don’t add a space before ellipses. Omit ellipses from menu items or buttons that open a dialog or start a process.

- Do
  - Ellipses show an action in progress
- Don't
  - Don’t use ellipses in buttons or menu items

### Use parentheses to define terms

Parentheses can be used to define acronyms or jargon or when referencing a source. They shouldn’t be used when adding a side note or an afterthought of a sentence.

- Do
  - Use parentheses to define terms and jargon
- Don't
  - Don’t use parentheses to add extra thoughts. If information is needed, include it in the sentence without parentheses for easier scanning and improved comprehension.

### Skip ampersands in body text

The “&” symbol can be used instead of “and” in headlines, column headers, table headers, navigation labels, and buttons. However, when there’s room, spelling out “and” can improve readability and make scanning easier.

“And” should be spelled out in sentences and paragraphs, before the final item in a 3+ item list, and in email subject lines.

- Do
  - Ampersands can be used in headlines where there's limited space
- Dont'
  - Avoid ampersands in email subject lines

### Use dashes with caution

Dashes and hyphens can interrupt a sentence and lead to a fragmented experience, so they should be used with caution. There are three kinds of dashes:

- Em dash: —
- En dash: –
- Hyphen: -

Em dashes are best avoided in UX writing, as they indicate a break in the flow of a sentence that could be simplified using a comma, period, or new sentence.

Use an en dash without spaces to indicate a range, such as 9 AM–Noon.

### Use hyphens with care

Hyphens can help readers better understand how words relate to each other by binding closely related words. They can also be used to represent negative numbers, such as -100. Spaces should never be used surrounding hyphens.

Refer to the Associated Press (AP) style guidelines if you are unsure whether an adjective or noun phrase needs a hyphen.

### Use italics sparingly

talics typically aren't easy to read. When emphasizing text, use bold weight instead.

However, italics can provide unique emphasis when applied to a single word or phrase, like a name or title.

- Do
  - Italicize a word or phrase
- Don't
  - Don’t italicize a sentence

### Don’t use caps blocks

Avoid using caps blocks altogether; they're not accessible.

[^1]: https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices
