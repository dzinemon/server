import React, { useState, useEffect, useRef } from 'react'
import Layout from '@/components/layout'

import { Listbox, Tab } from '@headlessui/react'

import toast, { Toaster } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

import dynamic from 'next/dynamic'
import {
  CheckIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid'

import Counter from '@/components/common/counter'

import { copyToClipboardRichText } from '@/pages/generate'

import { parseWithCheerio } from '../../utils/cheerio-axios'

const CustomEditorResult = dynamic(
  () => {
    return import('../components/custom-editor-result')
  },
  { ssr: false }
)

const prompts = [
  {
    id: 1,
    name: 'Create Linkedin post for Article',
    content: `Creating a viral linkedin post for the Post Author, based on the article below. Mention Post Author's name in the title.
        You are the social media manager for a CPA firm named Kruze Consulting that serves VC backed startups.
        Your website is full of helpful articles on finance, venture capital, accounting and taxes. 
        Your audience is startup founders;
        Write an eye catching linkedin post that highlights an excerpt from this article.  
        Include 2 hash tags.
        The article may or may not be a blog post, so don’t mention if it’s a blog post;
        The article may or may not have been recent, so don’t say is our latest or anything like that
        You will have a link to the article in the first comment - write 1st comment as well. 

        1st, here is an example of a great linkedin post you did on a recent podcast excerpt: ###
        First check VCs are incredibly hard to find. 🕵️‍♂️🔍

        Our VP of Financial Strategy interviews one of the leading first check VCs in Silicon Valley, @shomik, partner at @boldstart VC. 🎙️🌟
        He asks Shomik what is one piece of advice that he wishes founders knew prior to pitching him, and the answer surprised us. 😲🤔
        It wasn’t about metrics or TAM - it was about passion. ❤️🔥
        Check out an excerpt from the interview, and if you like it, watch the full podcast on YouTube or in your podcast player. 🎧📺
        Share if you find it as compelling as we do! 🔄👏
        ### 
        Now make one for the following article ###
      `,
  },
  {
    id: 2,
    name: 'LinkedIn Excerpt Podcast prompt',
    content: `
        # Creating a Viral Social Media Post based on a Podcast Excerpt #
      //Background
      * You are the social media manager for a CPA firm that serves VC backed startups, Kruze Consulting
      * Your executives record podcasts with important players in the VC and startup ecosystem.
      * You have taken a section of a podcast and created a short video that has compelling content that will not only educate startup founders, but that will be so interesting that they may want to go listen to the full podcast.
      * Note that excerpt is just a portion of the podcast. The entire podcast is a more wide ranging discussion.

      //Task
      * As the social media manager, you will upload the video so that it can be watched on LinedIn, and will have a link to the podcast in the first comment. 
      * Write an eye catching linkedin post that highlights a short video excerpt from a podcast. You want people to watch the excerpt and then go watch the full video/podcast. You don’t need to paraphrase or quote the excerpt, unless it will make the post more compelling. Teasing it, highlighting why it’s worth watching - these are good strategies, as is highlighting one or two of the most compelling or controversial opinions.
      * Note that excerpt is just a portion of the podcast. The entire podcast is a more wide ranging discussion. You can tease that the podcast has more awesome content on different topics, but do **not** make up what those other topics are, only specifically say what those topics are if info on them is provided in a subsequent prompt. 
      * **Avoid** the words, and derivatives of, dive and delve. Instead, use words like explore, learn about, hear from experts, dissect, unravel, investigate
      * You will link to the full podcast, get the link from article Link, and add links to podcast on Youtube and Apple Podcasts in a comment, not in the main post; write this comment as well. Strong CTA.
      * Full podcast is Link to article/source
      * Apple Podcast link - https://itunes.apple.com/us/podcast/founders-and-friends-podcast/id1125300270
      * Youtube link - https://www.youtube.com/watch?v=1CK25Aj9ar8
      * Take no action, I will paste into a second prompt the transcript that you can use to create the excerpt; if you understand reply “ready”
      * In the prompt I will next paste in an example of a great, viral post you wrote on a **different** podcast excerpt; do not use this content, it is only to help you understand what you’ve done before vis a vis tone and style that worked.

      //Example
      1st, here is an example of a great linkedin post you did on a recent podcast excerpt: ###
      First check VCs are incredibly hard to find. 🕵️‍♂️
      Our VP of Financial Strategy interviews one of the leading first check VCs in Silicon Valley, @shomik, partner at @boldstart VC. 🎙️
      He asks Shomik what is one piece of advice that he wishes founders knew prior to pitching him, and the answer surprised us. 🤔
      It wasn’t about metrics or TAM - it was about passion. 
      Check out an excerpt from the interview, and if you like it, watch the full podcast on YouTube or in your podcast player. 🎧
      Share if you find it as compelling as we do!


      Get the Info about the Podcast Guests from Article which is given below as well as get the Post Author below as a Podcast Host,
      Get the Link To the Podcast from the Link to article below

      
      Now make one for this podcast excerpt
      `,
  },
  // {
  //   id: 3,
  //   name: 'Create Viral Linkedin Post for YouTube Video',
  //   content:
  //     'Hey, I just published a new YouTube video on my channel. Check it out here: [YouTube Video Title]',
  // },
]

const repostersPrompts = [
  {
    id: 1,
    name: 'Executives Repost - Short',
    content: `Now let’s create short posts that our executives will use to repost what you just wrote on their LinkedIn accounts. 
    You can say that Executive Reposts - Short
    Create for Executives specified below in Executives Reposts Section

    Now let’s create short posts that our executives will use to repost what you just wrote on their LinkedIn accounts. 
    You can say that there is a link in the 1st comment of the original post, unless the post doesn’t say this. Make sure you say something like “link to the article in the original post” if the post says that there is a link in the 1st comment.
    Include 2 to 4 emojis in each executives’ post. 
    Provide one hashtag in each exec’s post. They should all share the same hashtags, make them the same for each exec.
    Each executive repost should be unique; don’t just change a few words, make them all different - don’t make them super similar
    Separate each executives post with a line so it’s easy to see which is which. 
    Also make sure that there good spacing in each executives post in between the paragraphs. This means putting a space in between each paragraph in each exec’s posts. This is important, I want it to look like each paragraph is it’s own thing, so make big paragraph spacing. 
    We will need one for Kruze Consulting, our CPA firm that serves VC backed startups; we are experts at advising startup founders on accounting, finance and tax.
    When you say that there is a link in the original post, make sure you mention who is posting it - it could be Kruze Consulting, it could be Vanessa Kruze, it could be Scott Orn or it could be Healy Jones. If it’s not clear who this is, just ask before writing so I can clarify. 
    Include a solid line in between each so it’s easy for them to find where each one starts
    This is an example of a good set of executives posts; it is an example, not the topic, use it for style and tone but use the content that you created in the previous post ### Founders, don't shortcut your startup's success. Having an address isn't just bureaucratic red tape—it's essential for state and federal compliance. 📑💼 
    Get the full scoop—link to the article in the original Kruze Consulting post. 
    Here are examples of good ones on a totally different topic, use these examples for tone and style only; notice how they all share the same hashtags: 

    Post for Vanessa Kruze, CPA and Founder/CEO of Kruze Consulting
    🌟 Excited to share our latest guide on VC Due Diligence! 🌟 
    A must-read for startups preparing for funding. 
    Check out key strategies like organizing essential documents 📁 and showcasing strong market fit 🌟.
    Find the link to the full article in the original Kruze Consulting post.
    #VentureCapital 

    Post for Healy Jones, VP Financial Strategy of Kruze Consulting
    Ok, so tax season stinks. For startup founders, it can seem like a big waste of time.
    BUT... it's better to get it right the first time. 
    Our recent article highlights the common tax filing mistakes to avoid. 
    Equip your startup with the right knowledge for a smoother tax process. 
    Check the link in the original Kruze Consulting post! 🌟🗓️
    hashtag#StartupTaxes

    there is a link in the 1st comment of the original post, unless the post doesn’t say this. Make sure you say something like “link to the article in the original post” if the post says that there is a link in the 1st comment.
    Include 2 to 4 emojis in each executives’ post. 
    Provide one hashtag in each exec’s post. They should all share the same hashtags, make them the same for each exec.
    Each executive repost should be unique; don’t just change a few words, make them all different - don’t make them super similar
    Separate each executives post with a line so it’s easy to see which is which. 
    Also make sure that there good spacing in each executives post in between the paragraphs. This means putting a space in between each paragraph in each exec’s posts. This is important, I want it to look like each paragraph is it’s own thing, so make big paragraph spacing. 
    We will need one for Kruze Consulting, our CPA firm that serves VC backed startups; we are experts at advising startup founders on accounting, finance and tax.
    When you say that there is a link in the original post, make sure you mention who is posting it - it could be Kruze Consulting, it could be Vanessa Kruze, it could be Scott Orn or it could be Healy Jones. If it’s not clear who this is, just ask before writing so I can clarify. 
    Include a solid line in between each so it’s easy for them to find where each one starts
    This is an example of a good set of executives posts; it is an example, not the topic, use it for style and tone but use the content that you created in the previous post ### Founders, don't shortcut your startup's success. Having an address isn't just bureaucratic red tape—it's essential for state and federal compliance. 📑💼 
    Get the full scoop—link to the article in the original Kruze Consulting post. 
    Here are examples of good ones on a totally different topic, use these examples for tone and style only; notice how they all share the same hashtags: 

    Post for Vanessa Kruze, CPA and Founder/CEO of Kruze Consulting
    🌟 Excited to share our latest guide on VC Due Diligence! 🌟 
    A must-read for startups preparing for funding. 
    Check out key strategies like organizing essential documents 📁 and showcasing strong market fit 🌟.
    Find the link to the full article in the original Kruze Consulting post.
    #VentureCapital 

    Post for Healy Jones, VP Financial Strategy of Kruze Consulting
    Ok, so tax season stinks. For startup founders, it can seem like a big waste of time.
    BUT... it's better to get it right the first time. 
    Our recent article highlights the common tax filing mistakes to avoid. 
    Equip your startup with the right knowledge for a smoother tax process. 
    Check the link in the original Kruze Consulting post! 🌟🗓️
    hashtag#StartupTaxes`,
  },
  {
    id: 2,
    name: 'Executives Repost - Basic',
    content: `Write reposts for Selected Reposters, separate each with solid lines`,
  },
]

const posters = [
  {
    id: 1,
    name: 'Healy Jones',
    title: 'VP of Financial Strategy',
    description: `Healy Jones, VP Financial Strategy of Kruze Consulting. Healy helps Kruze startup
clients prepare for VC fund raising, and is a startup founder, former VC who has invested
in dozens of startups, and ran marketing for several startup companies. He knows what
it’s like to build fast growing sales teams and marketing teams, and also what it’s like to
negotiate with VCs. He has helped startups raise over one billion dollars.`,
  },
  {
    id: 2,
    name: 'Vanessa Kruze, CPA',
    title: 'Founder and CEO',
    description: `Vanessa Kruze, CPA and founder/CEO of our CPA firm, Kruze Consulting.
Vanessa has worked with over 1000 startups on everything from getting their books
right to setting up their fintech systems to doing taxes - plus has advised them on
acquisition and VC due diligence. Kruze Consulting is an Inc 5000 fastest growing
company award winner six years in a row, so she knows a ton about growing a
business. You don’t have to mention that she’s worked with 1000 startups, but can
mention that she’s world with hundred or startups that have collectively raised billions in
funding.`,
  },
  {
    id: 3,
    name: 'Scott Orn',
    title: 'Chief Operating Officer',
    description: `Scott Orn, CFA and COO of our CPA firm Kruze Consulting. Scott has advised hundreds
of startups that have raised billions in VC funding and venture debt funding. He
understands the pressures startup founders have in quickly growing companies. He
also understands how to scale businesses on efficient budgets. He’s helped a ton of
founders get ready to fundraise and clean up their books`,
  },
  {
    id: 4,
    name: 'Kruze Consulting',
    title: 'Startup Accounting, Finance & Tax CPA Expertise',
    description: `Kruze only works
with VC-backed startups, and our clients have collectively raised over $15 billion in VC
funding. The Kruze team has helped over 1000 startups set up their accounting and
fintech systems.`,
  },
  {
    id: 5,
    name: 'Bill Hollowsky',
    title: 'CPA, VP Accounting Services',
    description: `Bill runs the team that delivers monthly
financials to hundreds of startups. His team also answers complicated accounting and
finance questions, and advises those startups as they raise venture capital or get
acquired by big tech companies. Clients his team works with have raised billions in
venture funding and have been acquired by companies including Apple, Workday, JP
Morgan and others. His professional background includes operating roles at a variety of
tech companies.`,
  },

  {
    id: 6,
    name: 'Bryce Dickson',
    title: 'Sales Person',
    description: `Bryce is a sales person at Kruze Consulting, he was trained as an
accountant and has a lot of experience helping startups grow. Write a post that is
helpful and informative and shows that he cares about the startup ecosystem, startup
 finance and accounting/taxes. Bryce is pretty junior, so don’t oversell his experience, he
 just wants to post helpful content.`,
  },
]

export default function LiPost() {
  const contentRef = useRef(null)
  const [isCopied, setIsCopied] = useState(false)

  const [aiResponse, setAiResponse] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [selectedPrompt, setSelectedPrompt] = useState()

  const [promptContent, setPromptContent] = useState('')

  const [selectedReposterPrompt, setSelectedReposterPrompt] = useState()

  const [reposterPromptContent, setReposterPromptContent] = useState('')

  const [selectedPoster, setSelectedPoster] = useState()

  const [selectedReposter, setSelectedReposter] = useState([])

  const [promptToGenerate, setPromptToGenerate] = useState('')

  const [pageContent, setPageContent] = useState('')

  const [pageUrl, setPageUrl] = useState('')

  // async function handlePageParse() {
  //   const url = pageUrl;
  //   const myHeaders = new Headers();
  //   myHeaders.append('Content-Type', 'application/json');

  //   if (!url) {
  //     toast.error('Please provide a URL', { duration: 2000 });
  //     return;
  //   }

  //   if (!url.startsWith('http')) {
  //     toast.error('Please provide a valid URL', { duration: 2000 });
  //     return;
  //   }

  //   const requestOptions = {
  //     method: 'POST',
  //     headers: myHeaders,
  //     body: JSON.stringify({ url }),
  //     redirect: 'follow',
  //   };

  //   try {
  //     const res = await fetch('/api/parse', requestOptions);
  //     const data = await res.json();
  //     setPageContent(data.pageContent);
  //     toast.success('Page content Ready', { duration: 2000 });
  //   } catch (error) {
  //     console.error('Error parsing page:', error);
  //     toast.error('Error parsing page content');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  const handlePageParse = async () => {
    // use parseWithCheerio function to get page content
    setIsLoading(true)

    try {
      if (!pageUrl) {
        toast.error('Please provide a URL', { duration: 2000 })
        return
      }

      if (!pageUrl.startsWith('http')) {
        toast.error('Please provide a valid URL', { duration: 2000 })
        return
      }
      const { pageContent } = await parseWithCheerio(pageUrl)

      setPageContent(pageContent)
      // setPageUrl(pageUrl)
      toast.success('Page content Ready', { duration: 2000 })
    } catch (error) {
      console.error('Error parsing page:', error)
      toast.error('Error parsing page content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePost = async () => {
    setIsLoading(true)

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToGenerate,
          model: 'gpt-4o',
          temperature: 0.1,
          instructions:
            'You are a helpful startup tax, accounting and bookkeeping assistant.',
          // maxTokens: 1000,
        }),
      }

      const { completion } = await fetch(
        '/api/openai/custom',
        requestOptions
      ).then((res) => res.json())

      setAiResponse(completion)
      toast.success('Post created successfully')
    } catch (error) {
      console.error('Error generating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // handle prompt to generate update when any of the selected values change
  useEffect(() => {
    // bundle new prompt with selected prompt content, page content, selected poster, selected reposter
    // get all variables values and bundle them together

    const ptg = `${promptContent || 'No prompt content selected'}

    Link to article/source: ${pageUrl || 'No URL provided'}

    Article: ${pageContent || 'No content parsed yet'}
    end of article

    Post Author: ${
      selectedPoster
        ? `${selectedPoster.name} \n ${selectedPoster.description}`
        : 'No Poster Selected'
    }

    Repost instructions: ${
      reposterPromptContent
        ? `${reposterPromptContent}`
        : 'No Reposter Prompt Selected'
    }

    Here are the executives you need to write reposts for. Include a couple of emojis in each: 
    ${
      selectedReposter.length === 0
        ? 'No Reposters Selected'
        : selectedReposter
            .map((person) => `\n ${person.name} \n ${person.description}`)
            .join(' \n\n')
    }
    `

    setPromptToGenerate(ptg)
  }, [
    // selectedPrompt,
    // selectedReposterPrompt,
    pageContent,
    selectedPoster,
    selectedReposter,
    pageUrl,
    promptContent,
    reposterPromptContent,
  ])

  useEffect(() => {
    if (
      selectedPrompt &&
      selectedPrompt.content &&
      selectedPrompt.content.length > 0
    ) {
      setPromptContent(selectedPrompt.content)
    }
  }, [selectedPrompt])

  useEffect(() => {
    if (
      selectedReposterPrompt &&
      selectedReposterPrompt.content &&
      selectedReposterPrompt.content.length > 0
    ) {
      setReposterPromptContent(selectedReposterPrompt.content)
    }
  }, [selectedReposterPrompt])

  return (
    <Layout>
      <div className="xl:container">
        <div className="flex min-h-full flex-wrap justify-center px-6 py-12 lg:px-8 -mx-2">
          <div className="w-full lg:w-1/2 px-2 space-y-6">
            {/* Select type of content Video/ Post/ Podcast */}

            <div className="w-3/4">
              <div className="font-bold text-xl">1. Select AI prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate Linkedin post
              </div>
              <Listbox value={selectedPrompt} onChange={setSelectedPrompt}>
                {
                  ({ open }) => (
                    <>
                      <div className="relative">
                        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <span className="block truncate">
                            {selectedPrompt?.name || 'Select Prompt to Generate Post'}
                          </span>

                          <ChevronDownIcon className={`
                          ${
                            open ? 'text-gray-600 rotate-180' : 'text-gray-400'
                          }
                            absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                          `} />
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {prompts.map((prompt) => (
                            <Listbox.Option
                              key={prompt.id}
                              className={({ active }) =>
                                `${
                                  active ? 'text-white bg-blue-600' : 'text-gray-900'
                                }
                                cursor-default select-none relative py-2 pl-10 pr-4`
                              }
                              value={prompt}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`${
                                      selected ? 'font-semibold' : 'font-normal'
                                    } block truncate`}
                                  >
                                    {prompt.name}
                                    {selected && (
                                      <CheckIcon
                                        className=" w-6 h-6 text-emerald-600 inline"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </>
                  )
                }
                
               
              </Listbox>
            </div>

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
            ></textarea>

            {/* Add url input to parse the content */}
            <div>
              <div className="font-bold text-xl">2. Add Content</div>
              <div className="text-sm text-gray-500">
                Add content via URL parse or Text Area
              </div>
              <Tab.Group>
                <Tab.List>
                  <Tab>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Url Parse
                      </div>
                    )}
                  </Tab>
                  <Tab>
                    {({ selected }) => (
                      <div
                        className={`${
                          selected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-400 text-white'
                        } rounded-t-lg px-2 py-1 text-xs`}
                      >
                        Text Area Input
                      </div>
                    )}
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <div className="p-2 bg-white border border-blue-500 rounded-b-lg space-y-3">
                      <label className="block  font-medium text-gray-700">
                        <div className="text-sm text-gray-500 ">
                          Add url input to parse the content
                        </div>
                      </label>
                      <input
                        type="text"
                        className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter the URL here"
                        onChange={(e) => setPageUrl(e.target.value)}
                        value={pageUrl || ''}
                      />

                      <div className="flex flex-row">
                        <button
                          type="button"
                          className={`w-full grow p-2 text-white bg-blue-600 rounded-lg
                        ${pageUrl ? 'bg-blue-500' : 'bg-gray-300'}`}
                          onClick={() => handlePageParse()}
                        >
                          {pageContent.length > 0 ? 'Reparse' : 'Parse Content'}
                        </button>
                      </div>
                    </div>
                  </Tab.Panel>
                  <Tab.Panel>
                    <div className="p-2 bg-white border border-blue-500 rounded-b-lg">
                      <div className="text-sm text-gray-500 ">
                        Enter the content here
                      </div>
                      <textarea
                        className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
                        placeholder="Enter the content here"
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                      ></textarea>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  {pageContent.length > 0
                    ? `✅ Content Ready`
                    : 'No content added yet'}
                </div>
                <div className="max-h-[80px] mb-3 p-2 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/10 via-white/70 to-white"></div>
                  <div className="text-xs text-gray-500">
                    {pageContent.length > 0 && `${pageContent}`}
                  </div>
                </div>
                <div className="flex flex-row">
                  {pageContent.length > 0 || pageUrl ? (
                    <button
                      className="w-auto p-2 ml-2 text-white bg-red-600 rounded-lg"
                      onClick={() => {
                        setPageUrl('')
                        setPageContent('')
                      }}
                    >
                      Reset Content
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>

            <div>
              {/* Select Who is posting the Post */}

              <div>
                <div className="font-bold text-xl">
                  3. Select Poster
                  {selectedPoster ? `: ${selectedPoster.name}` : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Select who is posting the post
                </div>
                <div className="flex flex-row">
                  <Listbox value={selectedPoster} onChange={setSelectedPoster}>
                    {({ open }) => (
                        <div className="relative">
                        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <span className="block truncate">
                            {selectedPoster?.name || 'Select Poster'}
                          </span>

                          <ChevronDownIcon className={` 
                          ${  
                            open ? 'text-gray-600 rotate-180' : 'text-gray-400'
                          }
                            absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                          `} />

                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {posters.map((poster) => (
                            <Listbox.Option
                              key={poster.id}
                              className={({ active }) =>
                                `${
                                  active
                                    ? 'text-white bg-blue-600'
                                    : 'text-gray-900'
                                }
                                cursor-default select-none relative py-2 pl-10 pr-4`
                              }
                              value={poster}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`${
                                      selected ? 'font-semibold' : 'font-normal'
                                    } block truncate`}
                                  >
                                    {poster.name}
                                    {selected && (
                                      <CheckIcon
                                        className=" w-6 h-6 text-emerald-600 inline"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                        </div>
                    )}
                    
                    
                   
                  </Listbox>
                  <div className="ml-2">
                    {/* //reset */}

                    {selectedPoster ? (
                      <button
                        className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                        onClick={() => setSelectedPoster('')}
                      >
                        Reset
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 px-2 space-y-6 rounded-lg">
            <div>
              <div className="font-bold text-xl">4. Select Reposter Prompt</div>
              <div className="text-sm text-gray-500">
                Select prompt to generate reposter post
              </div>
              <div className="flex flex-row">
                <Listbox
                  value={selectedReposterPrompt}
                  onChange={setSelectedReposterPrompt}
                >
                  {
                    ({ open }) => (
                    <div className="relative">
                    <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <span className="block truncate">
                        {selectedReposterPrompt
                          ? selectedReposterPrompt.name
                          : 'Select Reposter Prompt'}
                      </span>

                      <ChevronDownIcon className={`
                      ${
                        open ? 'text-gray-600 rotate-180' : 'text-gray-400'
                      }
                        absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                      `} />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {repostersPrompts.map((prompt) => (
                        <Listbox.Option
                          key={prompt.id}
                          className={({ active }) =>
                            `${
                              active
                                ? 'text-white bg-blue-600'
                                : 'text-gray-900'
                            }
                              cursor-default select-none relative py-2 pl-10 pr-4`
                          }
                          value={prompt}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`${
                                  selected ? 'font-semibold' : 'font-normal'
                                } block truncate`}
                              >
                                {prompt.name}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                    )
                  }
                  
                </Listbox>
                <div className="ml-2">
                  {/* //reset */}

                  {selectedReposterPrompt ? (
                    <button
                      className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                      onClick={() => setSelectedReposterPrompt('')}
                    >
                      Reset
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>

            <textarea
              className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Select prompt or Enter the content here"
              value={reposterPromptContent}
              onChange={(e) => setReposterPromptContent(e.target.value)}
            ></textarea>

            <div>
              {/* Add Multiple Select to pick up who Reposts */}

              <div>
                <div className="font-bold text-xl">5. Select Reposter</div>
                <div className="text-sm text-gray-500">
                  Select who is reposting the post
                </div>
                <div className="flex flex-row w-full">
                  <Listbox
                    value={selectedReposter}
                    onChange={setSelectedReposter}
                    multiple
                  >
                    {({ open }) => (
                      <div className="relative w-full">
                      <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-lg shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <span className="block truncate">
                          {selectedReposter.length > 0
                            ? 'Reposters: '
                            : 'Select Reposter'}
                          {selectedReposter
                            .map((person) => person.name)
                            .join(', ')}
                        </span>

                        <ChevronDownIcon className={`
                        ${
                          open ? 'text-gray-600 rotate-180' : 'text-gray-400'
                        }
                          absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2
                        `} />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 w-96 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {posters.map((reposter) => (
                          <Listbox.Option
                            key={reposter.id}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-white bg-blue-600'
                                  : 'text-gray-900'
                              }
                              cursor-default select-none relative py-2 pl-10 pr-4`
                            }
                            value={reposter}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? 'font-semibold' : 'font-normal'
                                  } block truncate`}
                                >
                                  {reposter.name}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                    )}
                  </Listbox>
                  <div className="ml-2">
                    {/* //reset */}

                    {selectedReposter.length > 0 ? (
                      <button
                        className="w-full p-2 text-sm text-white bg-red-600 rounded-lg"
                        onClick={() => setSelectedReposter([])}
                      >
                        Reset
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    {selectedReposter.length > 0
                      ? `Reposters: ${selectedReposter
                          .map((person) => person.name)
                          .join(', ')}`
                      : 'No reposter selected yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white mt-6 w-full" />

          <div className="w-full px-2 space-y-6 rounded-lg mt-6">
            <div>
              <div className="font-bold text-xl">Preview</div>
              <div className="text-sm text-gray-500">
                Preview the bundled prompt to generate the post
              </div>

              <textarea
                className="w-full h-96 p-2 border border-gray-300 rounded-lg"
                value={promptToGenerate}
                readOnly
              ></textarea>
            </div>
          </div>

          <div className="w-full px-2">
            <button
              className={`w-full py-2 text-white bg-blue-600 rounded-lg
                ${isLoading ? 'bg-gray-300 animate-pulse' : 'bg-blue-500'}
                `}
              onClick={() => {
                handleGeneratePost()
              }}
            >
              {isLoading ? <>
                Generating Post... for <Counter /> seconds 
              </> : 'Generate Post'}
            </button>
          </div>

          <div className="border-t border-emerald-600 mt-6 w-full" />

          <div className="w-full px-2">
            {aiResponse ? (
              <div>
                <div className="flex flex-wrap justify-between py-4">
                  <div className="w-auto flex flex-row">
                    <div>Copy the generated post:</div>
                    <div className="px-4">
                      <button
                        onClick={() => {
                          setIsCopied(true)
                          copyToClipboardRichText(contentRef.current)
                          setTimeout(() => setIsCopied(false), 1000)
                        }}
                        type="button"
                        className="p-2 w-36 flex justify-between bg-blue-500 text-white rounded text-xs hover:bg-blue-600 active:bg-blue-700 group"
                      >
                        {isCopied ? (
                          <>
                            Copied{' '}
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Copy to Clipboard
                            <ClipboardIcon className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <button
                      className="w-auto p-2 ml-2 text-white bg-red-600 rounded-lg"
                      onClick={() => setAiResponse('')}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {/* <CustomEditorResult initialData={aiResponse} /> */}

                <div className="bg-white rounded p-2 w-full">
                  <div
                    ref={contentRef}
                    className="prose prose-a:text-blue-600 w-full"
                  >
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-center py-20">
                <div className="italic text-slate-400">
                  No content to display.
                </div>
              </div>
            )}

            {/* {aiResponse && <div>
            <p>Ai response</p>
            <textarea
              className='w-full max-w-xl h-screen p-2 m-2 border border-gray-300 rounded-lg'
              value={
                aiResponse
              }
            >
              </textarea>
          </div>
          } */}
          </div>
        </div>
        <Toaster />
      </div>
    </Layout>
  )
}
