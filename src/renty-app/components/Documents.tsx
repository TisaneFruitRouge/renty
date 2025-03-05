import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from './ui/text';
import { DocumentWithProperty } from '@/queries/documents';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IconSymbol } from './ui/IconSymbol';

interface DocumentsProps {
  documents: DocumentWithProperty[];
}

// Helper function to get file icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return 'doc.text';
  if (fileType.includes('image')) return 'photo';
  if (fileType.includes('word') || fileType.includes('doc')) return 'doc.text';
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'tablecells';
  return 'doc';
};

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function Documents({ documents }: DocumentsProps) {
  const { t } = useTranslation();

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Can't open this URL: ", url);
    }
  };

  return (
    <>
      {documents.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <IconSymbol name="doc.text" size={50} color="#9ca3af" />
          <Text className="text-center text-muted-foreground mt-4">
            {t('documents.noDocuments')}
          </Text>
        </View>
      ) : (
        documents.map((document, index) => (
          <TouchableOpacity
            key={document.id}
            activeOpacity={0.5}
            onPress={() => openUrl(document.fileUrl)}
          >
            <View
              className={cn(
                "bg-white rounded-xl p-4",
                "border-b border-black/20",
                index === 0 && "last:border-t"
              )}
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-muted rounded-lg p-2 mr-3">
                  <IconSymbol
                    name={getFileIcon(document.fileType)}
                    size={24}
                    color="#4b5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold">
                    {document.name}
                  </Text>
                  {document.description && (
                    <Text className="text-sm text-muted-foreground">
                      {document.description}
                    </Text>
                  )}
                </View>
              </View>

              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">{t('documents.property')}:</Text>
                  <Text>{document.property.title}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">{t('documents.category')}:</Text>
                  <Text>{t(`documents.categories.${document.category}`)}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">{t('documents.uploadedAt')}:</Text>
                  <Text>
                    {format(new Date(document.uploadedAt), 'd MMM yyyy', { locale: fr })}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">{t('documents.fileSize')}:</Text>
                  <Text>{formatFileSize(document.fileSize)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </>
  );
}
