import { supabase } from './supabaseClient';

export const Core = {
  InvokeLLM: async (prompt, options = {}) => {
    const { data, error } = await supabase.functions.invoke('invoke-llm', {
      body: { prompt, ...options }
    });
    if (error) throw error;
    return data;
  },

  SendEmail: async (to, subject, body, options = {}) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body, ...options }
    });
    if (error) throw error;
    return data;
  },

  UploadFile: async (params) => {
    const { file, path, bucket = 'photos' } = typeof params === 'object' && params.file ? params : { file: params };
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { path: filePath, url: publicUrl, file_url: publicUrl };
  },

  GenerateImage: async (prompt, options = {}) => {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt, ...options }
    });
    if (error) throw error;
    return data;
  },

  ExtractDataFromUploadedFile: async (fileUrl, options = {}) => {
    const { data, error } = await supabase.functions.invoke('extract-file-data', {
      body: { fileUrl, ...options }
    });
    if (error) throw error;
    return data;
  },

  CreateFileSignedUrl: async (path, bucket = 'photos', expiresIn = 3600) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  UploadPrivateFile: async (file, path, bucket = 'private-photos') => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    return { path: filePath };
  }
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;
