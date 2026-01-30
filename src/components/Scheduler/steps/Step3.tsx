import { Input } from "@/components/form";

export const Step3: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <Input name="name" label="Nome" placeholder="Digite seu nome" />
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="Digite seu email"
      />
      <Input
        name="phone"
        type="tel"
        label="Telefone"
        placeholder="Digite seu telefone"
      />
    </div>
  );
};
