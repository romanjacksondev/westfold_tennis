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
    <Card className="player-card" key={id}>
      {session && (
        <div className="player-card-menu">
          <Dropdown inline label="">
            <DropdownItem>
              <a
                href="#"
                className="player-card-edit"
              >
                Editar
              </a>
            </DropdownItem>
            <DropdownItem>
              <a
                href="#"
                className="player-card-delete"
              >
                Eliminar
              </a>
            </DropdownItem>
          </Dropdown>
        </div>
      )}
      <div className="player-card-body">
        <Image
          alt={`${name} ${lastname} image`}
          height="96"
          src={imageUrl}
          width="96"
          className="player-avatar"
        />
        <p className="player-card-name">{name} {lastname}</p>
        <p className="player-card-nickname">“{nickname}”</p>
      </div>
    </Card>
  );
}
