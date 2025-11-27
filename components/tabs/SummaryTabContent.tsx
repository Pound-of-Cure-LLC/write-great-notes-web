'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

type SummaryTabContentProps = {
  summary: string | null
  loading: boolean
}

export function SummaryTabContent({ summary, loading }: SummaryTabContentProps) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide mb-3 text-foreground">AI Summary</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : summary ? (
        <Card>
          <CardContent className="p-4">
            <MarkdownRenderer content={summary} className="text-sm" />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground py-8">No summary available.</p>
      )}
    </div>
  )
}
