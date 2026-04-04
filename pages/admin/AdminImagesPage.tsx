
import React from 'react';
import InboxInIcon from '../../components/icons/InboxInIcon';

const AdminImagesPage: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <InboxInIcon className="w-6 h-6" />
          Imagens Enviadas por Clientes
        </h1>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <p className="text-slate-400">
          Nesta seção, você poderá visualizar e gerenciar todas as artes e imagens que os clientes enviarem para os pedidos de produtos personalizados, como adesivos e cartões de visita.
        </p>
      </div>
    </div>
  );
};

export default AdminImagesPage;
