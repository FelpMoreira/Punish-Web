import { Card } from '../components/ui/Card'
import { Topbar } from '../components/layout/Topbar'

export function Settings() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        <div className="max-w-[420px]">
          <Card title="Settings">
            <div className="text-sm text-muted">
              Settings coming soon.
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
