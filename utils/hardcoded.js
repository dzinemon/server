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
    name: 'Kruze Consulting',
    title: 'Startup Accounting, Finance & Tax CPA Expertise',
    description: `Kruze only works
with VC-backed startups, and our clients have collectively raised over $15 billion in VC
funding. The Kruze team has helped over 1000 startups set up their accounting and
fintech systems.`,
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
    name: 'Healy Jones',
    title: 'VP of Financial Strategy',
    description: `Healy Jones, VP Financial Strategy of Kruze Consulting. Healy helps Kruze startup
clients prepare for VC fund raising, and is a startup founder, former VC who has invested
in dozens of startups, and ran marketing for several startup companies. He knows what
it’s like to build fast growing sales teams and marketing teams, and also what it’s like to
negotiate with VCs. He has helped startups raise over one billion dollars.`,
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

const models = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-3-5-sonnet-20240620',
]

export { prompts, repostersPrompts, posters, models }