import { CmsButton } from "@/components/cms/cms-ui";

/** Edit + optional extra links + delete — used on CMS list rows. */
export function CmsListActions({
  onEdit,
  onDelete,
  children,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center">
      <CmsButton type="button" onClick={onEdit}>
        Edit
      </CmsButton>
      {children}
      <CmsButton variant="danger" type="button" onClick={onDelete}>
        Delete
      </CmsButton>
    </div>
  );
}
