"use client";

import { AppLayout } from "@/components/AppLayout";
import { AppointmentCard } from "@/components/AppointmentCard";
import { TranscriptionStatusProvider } from "@/contexts/TranscriptionStatusContext";

// Sample appointment data
const sampleAppointments = [
  {
    id: "apt-1",
    appointment_datetime: "2024-10-16T10:30:00Z",
    patient: {
      first_name: "Bessie",
      last_name: "Cooper",
      mrn: "123456789",
      date_of_birth: "1955-06-05",
      gender: "Female",
      phone: "(270) 555-0117",
      email: "bessie.cooper@example.com",
    },
    visit_type: {
      name: "Annual Physical",
    },
  },
  {
    id: "apt-2",
    appointment_datetime: "2024-10-16T11:00:00Z",
    patient: {
      first_name: "John",
      last_name: "Doe",
      mrn: "987654321",
      date_of_birth: "1970-03-15",
      gender: "Male",
      phone: "(555) 123-4567",
      email: "john.doe@example.com",
    },
    visit_type: {
      name: "Follow-up",
    },
  },
  {
    id: "apt-3",
    appointment_datetime: "2024-10-16T13:30:00Z",
    patient: {
      first_name: "Jane",
      last_name: "Smith",
      mrn: "456789123",
      date_of_birth: "1985-11-22",
      gender: "Female",
      phone: "(555) 987-6543",
      email: "jane.smith@example.com",
    },
    visit_type: {
      name: "New Patient",
    },
  },
  {
    id: "apt-4",
    appointment_datetime: "2024-10-16T14:00:00Z",
    patient: {
      first_name: "Michael",
      last_name: "Johnson",
      mrn: "321654987",
      date_of_birth: "1992-08-10",
      gender: "Male",
      phone: "(555) 456-7890",
      email: "michael.j@example.com",
    },
    visit_type: {
      name: "Consultation",
    },
  },
];

/**
 * AppointmentCardsExample: Demo page showing AppointmentCard component
 *
 * This page demonstrates:
 * - 600px width appointment cards
 * - Left sidebar with time and status
 * - Patient demographics layout
 * - Click handlers and hover effects
 */
export default function AppointmentCardsExamplePage() {
  return (
    <TranscriptionStatusProvider transcriptionIds={[]}>
      <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Appointment Card Component
          </h1>
          <p className="text-muted-foreground">
            Demonstration of the reusable appointment card (600px width)
          </p>
        </div>

        {/* Section 1: Standard Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Standard Appointment Cards</h2>
          <p className="text-sm text-muted-foreground mb-4">
            600px wide (reduced from 800px), with time sidebar and real-time
            status indicator. Use in: Appointments schedule page.
          </p>
          <div className="space-y-4">
            {sampleAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() =>
                  alert(
                    `Clicked: ${appointment.patient.first_name} ${appointment.patient.last_name} at ${new Date(appointment.appointment_datetime).toLocaleTimeString()}`
                  )
                }
              />
            ))}
          </div>
        </section>

        <hr className="border-t" />

        {/* Section 2: Without Phone/Email */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Appointment Card (Minimal Info)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Example with minimal patient data (no phone/email).
          </p>
          <AppointmentCard
            appointment={{
              id: "apt-minimal",
              appointment_datetime: "2024-10-16T15:30:00Z",
              patient: {
                first_name: "Sarah",
                last_name: "Williams",
                mrn: "111222333",
                date_of_birth: "1978-04-20",
                gender: "Female",
                phone: null,
                email: null,
              },
              visit_type: {
                name: "Urgent Care",
              },
            }}
          />
        </section>

        <hr className="border-t" />

        {/* Section 3: Design Specifications */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Design Specifications</h2>
          <div className="bg-muted/30 rounded-lg p-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Width:</span>
              <span className="text-muted-foreground">
                600px (reduced from 800px)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Height:</span>
              <span className="text-muted-foreground">Auto (based on content)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Left Sidebar:</span>
              <span className="text-muted-foreground">
                Time display + AppointmentStatusBar indicator
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Layout:</span>
              <span className="text-muted-foreground">
                4-column grid: Name/MRN (1 col) + Demographics (3 cols split into 2)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Colors:</span>
              <span className="text-muted-foreground">
                Primary blue sidebar, theme-based text colors
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold w-32">Status:</span>
              <span className="text-muted-foreground">
                Real-time updates via AppointmentStatusBar component
              </span>
            </div>
          </div>
        </section>

        <hr className="border-t" />

        {/* Section 4: Use Cases */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                1. Appointments Schedule Page
              </h3>
              <p className="text-muted-foreground">
                Display daily schedule with time-sorted cards. Click to navigate
                to transcription page.
              </p>
              <code className="block mt-2 text-xs bg-muted/30 p-2 rounded">
                {`<AppointmentCard
  appointment={appointment}
  onClick={() => router.push(\`/appointments/\${appointment.id}/transcribe\`)}
/>`}
              </code>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                2. Provider Dashboard
              </h3>
              <p className="text-muted-foreground">
                Show upcoming appointments for a specific provider with real-time
                status updates.
              </p>
              <code className="block mt-2 text-xs bg-muted/30 p-2 rounded">
                {`{appointments
  .filter(apt => apt.provider_id === currentProvider)
  .map(apt => <AppointmentCard key={apt.id} appointment={apt} />)
}`}
              </code>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                3. Patient Appointment History
              </h3>
              <p className="text-muted-foreground">
                List all appointments for a patient on their detail page.
              </p>
              <code className="block mt-2 text-xs bg-muted/30 p-2 rounded">
                {`<AppointmentCard
  appointment={appointment}
  onClick={() => router.push(\`/appointments/\${appointment.id}/note\`)}
/>`}
              </code>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
    </TranscriptionStatusProvider>
  );
}
