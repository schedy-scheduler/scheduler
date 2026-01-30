import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeService, type Store } from "@/services/storeService";
import { Avatar } from "@/components/Avatar";

export function Success() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const data = await storeService.getStoreBySlug(slug);
        setStore(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  const handleNewAppointment = () => {
    navigate(`/${slug}`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-full bg-zinc-700 rounded-bl-3xl rounded-br-3xl h-25" />
      <div className="-mt-9">
        <Avatar name={store?.name ?? ""} isLoading={loading} />
      </div>
      <strong className="text-lg font-semibold text-zinc-700">
        {store?.name ?? ""}
      </strong>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Mensagem principal */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Agendamento confirmado!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Seu agendamento foi realizado com sucesso. Você receberá uma
          confirmação por email.
        </p>

        {/* Informações do agendamento */}
        <div className="w-full bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Detalhes do agendamento
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">
                Verifique seu email para detalhes da data e horário
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                Chegue com 10 minutos de antecedência
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <User className="w-5 h-5" />
              <span className="text-sm">
                Em caso de imprevistos, entre em contato
              </span>
            </div>
          </div>
        </div>

        {/* Botão para novo agendamento */}
        <Button onClick={handleNewAppointment} className="w-full">
          Fazer novo agendamento
        </Button>
      </div>
    </div>
  );
}
