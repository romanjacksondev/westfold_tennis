import { Card, Dropdown, DropdownItem } from 'flowbite-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import type { CardComponentType } from './types/CardComponentType';

export default function CardComponent({
  id,
  name,
  lastname,
  imageUrl,
  nickname,
}: CardComponentType) {
  const { data: session } = useSession();

  return (
    <Card className="w-full h-full" key={id}>
      {session && (
        <div className="flex justify-end px-4 pt-4">
          <Dropdown inline label="">
            <DropdownItem>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Editar
              </a>
            </DropdownItem>
            <DropdownItem>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Eliminar
              </a>
            </DropdownItem>
          </Dropdown>
        </div>
      )}
      <div className="flex flex-col items-center pb-10">
        <Image
          alt={`${name} ${lastname} image`}
          height="96"
          src={imageUrl}
          width="96"
          className="mb-3 rounded-full shadow-lg"
        />
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{`${name} "${nickname}" ${lastname}`}</h5>
        <div className="mt-4 flex space-x-3 lg:mt-6">
          <a
            href="#"
            className="inline-flex items-center rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
          >
            Add friend
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            Message
          </a>
        </div>
      </div>
    </Card>
  );
}
