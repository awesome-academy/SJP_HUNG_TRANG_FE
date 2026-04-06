import { signOut } from "next-auth/react"

import { ROUTES } from "@/constants/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileEditorPanelText = {
  title: string
  description: string
  nameLabel: string
  emailLabel: string
  phoneLabel: string
  addressLabel: string
  notProvidedPlaceholder: string
  editLabel: string
  saveLabel: string
  cancelLabel: string
  signOutLabel: string
}

type ProfileEditorPanelProps = {
  text: ProfileEditorPanelText
  fullName: string
  email: string
  phone: string | undefined
  address: string | undefined
  isEditing: boolean
  onFullNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onAddressChange: (value: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileEditorPanel({
  text,
  fullName,
  email,
  phone,
  address,
  isEditing,
  onFullNameChange,
  onPhoneChange,
  onAddressChange,
  onEdit,
  onSave,
  onCancel,
}: ProfileEditorPanelProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-zinc-900">{text.title}</h2>
        <p className="text-sm text-zinc-600">{text.description}</p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{text.nameLabel}</Label>
            <Input
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              disabled={!isEditing}
              placeholder={text.notProvidedPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{text.emailLabel}</Label>
            <Input value={email || ""} placeholder={text.notProvidedPlaceholder} disabled />
          </div>

          <div className="space-y-2">
            <Label>{text.phoneLabel}</Label>
            <Input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              disabled={!isEditing}
              placeholder={text.notProvidedPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{text.addressLabel}</Label>
            <Input
              value={address}
              onChange={(event) => onAddressChange(event.target.value)}
              disabled={!isEditing}
              placeholder={text.notProvidedPlaceholder}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button
              type="button"
              className="rounded-none border border-[#7faa3d] bg-[#7faa3d] text-white hover:border-[#6f9835] hover:bg-[#6f9835]"
              onClick={onEdit}
            >
              {text.editLabel}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                className="rounded-none border border-[#7faa3d] bg-[#7faa3d] text-white hover:border-[#6f9835] hover:bg-[#6f9835]"
                onClick={onSave}
              >
                {text.saveLabel}
              </Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={onCancel}>
                {text.cancelLabel}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="destructive"
            className="rounded-none"
            onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
          >
            {text.signOutLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
