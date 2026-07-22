import { PageHeader } from '../../../shared/ui/PageHeader';

type StoresPageHeaderProps = {
  title: string;
  description: string;
  createButtonLabel: string;
  onCreate: () => void;
};

export function StoresPageHeader({
  title,
  description,
  createButtonLabel,
  onCreate,
}: StoresPageHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      actionLabel={createButtonLabel}
      onAction={onCreate}
    />
  );
}
