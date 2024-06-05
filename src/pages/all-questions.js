import React, { useState, useEffect } from "react"
import Layout from "@/components/layout"
import AllQuestionsDataTable from "@/components/common/AllQuestionsDataTable"

export default function AllQuestions() {
  return (
    <Layout>
      <AllQuestionsDataTable />
    </Layout>
  
  )
}