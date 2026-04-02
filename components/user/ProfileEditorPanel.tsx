import { signOut } from "next-auth/react"

import { ROUTES } from "@/constants/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProfileEditorPanelProps = {
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
  fullName: string
  email: string
  phone: string
  address: string
  isEditing: boolean
  onFullNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onAddressChange: (value: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function ProfileEditorPanel({
  title,
  description,
  nameLabel,
  emailLabel,
  phoneLabel,
  addressLabel,
  notProvidedPlaceholder,
  editLabel,
  saveLabel,
  cancelLabel,
  signOutLabel,
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
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-600">{description}</p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{nameLabel}</Label>
            <Input
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              disabled={!isEditing}
              placeholder={notProvidedPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{emailLabel}</Label>
            <Input value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label>{phoneLabel}</Label>
            <Input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              disabled={!isEditing}
              placeholder={notProvidedPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label>{addressLabel}</Label>
            <Input
              value={address}
              onChange={(event) => onAddressChange(event.target.value)}
              disabled={!isEditing}
              placeholder={notProvidedPlaceholder}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button type="button" className="rounded-none" onClick={onEdit}>
              {editLabel}
            </Button>
          ) : (
            <>
              <Button type="button" className="rounded-none" onClick={onSave}>
                {saveLabel}
              </Button>
              <Button type="button" variant="outline" className="rounded-none" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="destructive"
            className="rounded-none"
            onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
          >
            {signOutLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
