"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"

// Mock data for existing leave
const existingLeave = [
  { id: 1, startDate: new Date(2024, 4, 15), endDate: new Date(2024, 4, 15), reason: "Personal", status: "Approved" },
  { id: 2, startDate: new Date(2024, 5, 10), endDate: new Date(2024, 5, 12), reason: "Conference", status: "Pending" },
]

export default function DoctorLeave() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [reason, setReason] = useState("")

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([])
      return
    }
    setSelectedDates(dates)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would submit the leave request to the server
    alert("Leave request submitted successfully!")
    setSelectedDates([])
    setReason("")
  }

  const handleCancelLeave = (id: number) => {
    // In a real app, you would send a request to cancel the leave
    alert(`Leave request ${id} cancelled.`)
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Request and manage your leave schedule.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Request Leave</CardTitle>
              <CardDescription>Select dates when you will be unavailable for appointments.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Select Date(s)</div>
                  <div className="max-w-md mx-auto">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={handleDateSelect}
                      className="rounded-md border w-full"
                      disabled={(date) => {
                        // Disable past dates
                        const now = new Date()
                        now.setHours(0, 0, 0, 0)
                        return date < now
                      }}
                    />
                  </div>

                  {selectedDates.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Selected Dates:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDates
                          .sort((a, b) => a.getTime() - b.getTime())
                          .map((date, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(date, "MMM d, yyyy")}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Leave</label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe the reason for your leave"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="ml-auto bg-green-600 hover:bg-green-700"
                  disabled={selectedDates.length === 0 || !reason}
                >
                  Submit Request
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave</CardTitle>
              <CardDescription>Your approved and pending leave requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {existingLeave.length > 0 ? (
                <div className="space-y-4">
                  {existingLeave.map((leave) => (
                    <div key={leave.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {format(leave.startDate, "MMM d, yyyy")}
                              {!isSameDay(leave.startDate, leave.endDate) &&
                                ` - ${format(leave.endDate, "MMM d, yyyy")}`}
                            </h3>
                            <Badge
                              variant={leave.status === "Approved" ? "default" : "secondary"}
                              className={leave.status === "Approved" ? "bg-green-500" : ""}
                            >
                              {leave.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Reason: {leave.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelLeave(leave.id)}
                          disabled={leave.status === "Approved"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">You have no upcoming leave scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
