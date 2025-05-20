
import { User } from "./types";
import { useEmailTemplates } from "./useEmailTemplates";
import { useUserSelection } from "./useUserSelection";
import { useEmailSending } from "./useEmailSending";

export const useSendEmail = (users: User[], onSendSuccess: () => void, onClose: () => void) => {
  const {
    selectedTemplate,
    subject,
    customMessage,
    setSubject,
    setCustomMessage,
    handleTemplateChange,
    generateTemplateData
  } = useEmailTemplates();

  const {
    selectedUsers,
    searchTerm,
    filteredUsers,
    setSearchTerm,
    handleUserToggle,
    handleSelectAll
  } = useUserSelection(users);

  const {
    sending,
    sendEmails: sendEmailsImpl
  } = useEmailSending(
    selectedTemplate,
    selectedUsers,
    subject,
    generateTemplateData,
    users
  );

  const sendEmails = async () => {
    await sendEmailsImpl(onSendSuccess, onClose);
  };

  return {
    selectedTemplate,
    selectedUsers,
    subject,
    customMessage,
    sending,
    searchTerm,
    filteredUsers,
    handleUserToggle,
    handleSelectAll,
    handleTemplateChange,
    setSubject,
    setCustomMessage,
    setSearchTerm,
    sendEmails
  };
};

export type { User } from "./types";
