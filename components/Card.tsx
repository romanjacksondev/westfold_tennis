import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";

const CustomCard = ({ containerStyle, description, title, titleHref }) => {
  const router = useRouter();
  return (
    <Card className={containerStyle}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Button variant="outline" onClick={() => router.push(titleHref)}>
          Ver mas
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomCard;
