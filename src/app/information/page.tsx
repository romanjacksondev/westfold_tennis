import { Suspense } from 'react';
import Information from '@/components/features/information';

export default function InformationPage() {
  return (
    <Suspense fallback={<main className="info-page" aria-busy="true" />}>
      <Information />
    </Suspense>
  );
}
