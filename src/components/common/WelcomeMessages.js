import { Tab, Dialog, Transition } from '@headlessui/react'
import { useState, Fragment } from 'react'

export const categories = [
  {
    name: 'Startup Accounting',
    questions: [
      'What is the difference between accrual and cash basis accounting?',
      'What is double-entry accounting?',
      'How should I set up a chart of accounts for a SaaS company?',
      'How should convertible note interest be recorded on the P&L?',
      'What are generally accepted accounting principles (GAAP)?',
      'How do I recognize recurring or perpetual revenue?',
    ],
  },
  {
    name: 'Startup Bookkeeping',
    questions: [
      'What are bookkeeping best practices for early-stage companies?',
      'How do I track employee or contractor expenses?',
      'Which bookkeeping software is best for startups?',
      'How do I record due diligence fees related to a fundraising round?',
    ],
  },
  {
    name: 'Startup Taxes',
    questions: [
      'What tax deductions are available for new businesses?',
      'Are COBRA reimbursements taxable to employees?',
      'Are VC investments taxed?',
      'What are the tax filing requirements for C-Corps in California?',
      'When are US C-Corps required to file IRS income tax returns?',
      'What should I know about franchise taxes?',
      'Do all Delaware C-corporations have to file Delaware state income taxes?',
      'What is the purpose of the annual franchise tax report?',
    ],
  },
  {
    name: 'R&D Tax Credits',
    questions: [
      'Which expenses qualify for the R&D tax credit?',
      'When should I file for the R&D tax credit?',
      'How do I document R&D expenses for tax credits?',
      'What are the common pitfalls when claiming R&D tax credits?',
    ],
  },
  {
    name: 'Due Diligence',
    questions: [
      'What is involved in an audit readiness process for startups?',
      'What are the steps for due diligence when raising funds?',
      'How should I prepare my financials for due diligence?',
      'What documents are typically requested during due diligence?',
    ],
  },
  {
    name: 'Venture Capital and Fundraising',
    questions: [
      'What is the cost to convert financial statements to GAAP for VC submission?',
      'Do VCs care about GAAP financials?',
      'How do I raise VC funding?',
      'Explain why a VC-backed startup needs to file Form 1120.',
      'How do you account for personal money contributed to a C-Corp before fundraising?',
      'What materials are needed to support a due diligence request from VCs?',
    ],
  },
  {
    name: 'Financial Strategy and Planning',
    questions: [
      'How do I create a financial forecast for a startup?',
      'What is the best approach to budgeting for a new business?',
      'What are the key components of a solid financial plan for a startup?',
      'How should ownership and equity be split among founders?',
      'When should businesses start tracking cost of goods sold?',
      'How much equity compensation do startup founders typically receive?',
    ],
  },
  {
    name: 'Tax Planning and Optimization',
    questions: [
      'What are best practices for tax planning for startups?',
      'How can startups optimize their tax positions?',
      'Should R&D expenses be amortized on the tax return?',
      'How do I take advantage of the R&D tax credit?',
    ],
  },
  {
    name: 'Finance as a Service (FaaS)',
    questions: [
      'What is Finance as a Service (FaaS) and how can it help my startup?',
      'What outsourced financial services are available for startups?',
      'How do I choose the right FaaS provider for my business?',
      'What are the benefits of using FaaS for financial management?',
    ],
  },
  {
    name: 'Venture Debt',
    questions: [
      'What are the most important things to consider before taking venture debt?',
      'How does venture debt differ from other types of financing options?',
      'What are the risks and benefits of venture debt for startups?',
      'How do I determine if venture debt is right for my startup?',
    ],
  },
  {
    name: 'Startup CFO',
    questions: [
      'What does a startup CFO do?',
      'When should I hire a CFO for my startup?',
      'What are typical CFO salary ranges for early-stage startups?',
      'What are the steps to hiring and interviewing a CFO?',
    ],
  },
  {
    name: '409A Valuation',
    questions: [
      'What is a 409A valuation and why is it required?',
      'What are common 409A valuation ranges for startups?',
      'How do I support an initial valuation without revenue?',
      'What are the consequences of not having a 409A valuation?',
    ],
  },
  {
    name: 'Mergers and Acquisitions',
    questions: [
      'What should founders know when preparing for an acquisition?',
      'What is the process for a startup to be acquired?',
      'What documentation is required in an M&A scenario?',
      'How do I value my startup for a potential acquisition?',
    ],
  },
  {
    name: 'Tax Forms',
    questions: [
      'What is Form 1120 and who needs to file it?',
      'When do I issue Form 1099 to contractors?',
      'What are the step-by-step instructions for completing Schedule G?',
      'What is a W-8BEN form and when is it required?',
    ],
  },
  {
    name: 'Startup Financial Systems',
    questions: [
      'What accounting systems or ERPs are recommended for startups?',
      'What billing and revenue management tools should a SaaS startup use?',
      'Which expense management tools are best for startups?',
      'How do I choose between QuickBooks Online and QuickBooks Desktop?',
    ],
  },
  {
    name: 'Startup Human Resources',
    questions: [
      'What are standard founder and executive salaries by stage?',
      'Can a founder be paid as a contractor or must they be an employee?',
      'How should equity grants and stock options be structured for employees?',
      'What are the best payroll systems for startups?',
      'What health and employee benefits are common for early-stage companies?',
      'What should be included in a startup holiday calendar?',
      'How do I handle remote and international contractor payments?',
    ],
  },
]

export function WelcomeMessages({ categories, onMessageClick }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false) // State to control Dialog

  if (!categories || categories.length === 0) {
    return <div className="text-gray-500">No welcome messages available.</div>
  }
  return (
    <>
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <>
          <div className="lg:text-lg">
            Ask questions about{' '}
            {categories.slice(0, 7).map((category, idx) => (
              <span key={category.name + idx + '-welcome-msg'}>
                <button
                  className={`
                    text-blue-600 underline underline-offset-2 hover:decoration-solid 
                    ${
                      category.name === categories[selectedIndex]?.name
                        ? 'decoration-solid decoration-blue-600'
                        : 'decoration-dotted decoration-blue-400'
                    }
                    `}
                  onClick={() => {
                    setSelectedIndex(idx)
                    onMessageClick(category.questions[0])
                  }}
                >
                  {category.name}
                </button>
                {idx < categories.length - 1 ? ', ' : ''}
              </span>
            ))}
            and{' '}
            <button
              className="text-blue-600 underline underline-offset-2 decoration-dotted hover:decoration-solid decoration-blue-400"
              onClick={() => setIsDialogOpen(true)} // Open Dialog
            >
              more
            </button>
            .{' '}
            <div className="my-4 text-gray-600">
              Here are some <strong>{categories[selectedIndex]?.name}</strong>{' '}
              questions to get you started:
            </div>
          </div>

          <Tab.List className="flex flex-wrap gap-1 mb-4 hidden">
            {categories.map((category, idx) => (
              <Tab
                key={category.name + idx + '-tab'}
                className={({ selected }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium ${
                    selected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`
                }
              >
                {category.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {categories.map((category, idx) => (
              <Tab.Panel key={idx + '-panel'} className="">
                {category.questions
                  .slice(0, 4) // Limit to first 4
                  .map((question) => (
                    <button
                      key={question + idx + '-question-btn'}
                      className={`block w-full text-left px-4 py-2 mt-2 rounded-lg hover:bg-blue-50 hover:text-blue-800 text-gray-800 bg-gray-50`}
                      onClick={() => onMessageClick(question)}
                    >
                      {question}
                    </button>
                  ))}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </>
      </Tab.Group>

      {/* Dialog for more categories */}
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDialogOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    More Categories
                  </Dialog.Title>
                  <div className="mt-2 space-y-2">
                    {categories
                      .filter((_, idx) => idx >= 7)
                      .map((category, idx) => (
                        <button
                          key={category.name + idx + '-more-btn'}
                          className="block text-blue-600 underline underline-offset-2 decoration-dotted hover:decoration-solid decoration-blue-400"
                          onClick={() => {
                            setSelectedIndex(idx + 7)
                            onMessageClick(category.questions[0])
                            setIsDialogOpen(false) // Close Dialog
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
