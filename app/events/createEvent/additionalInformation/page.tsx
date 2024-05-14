

import { Separator } from "@/components/ui/separator"
import  AdditionalForm from "./additionalInfo-form"

export default function AdditionalInformationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Additional Information</h3>
        <p className="text-sm text-muted-foreground">
          Fill the form to provide additional information about your event.
        </p>
      </div>
      <Separator />
      <AdditionalForm />
    </div>
  )
}