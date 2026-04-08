/**
 * Service to handle image uploads to GitHub
 */

export const isGitHubConfigured = (settings: any) => {
  return !!(settings.githubToken && settings.githubOwner && settings.githubRepo);
};

export const uploadToGitHub = async (
  file: File | string,
  token?: string,
  owner?: string,
  repo?: string,
  branch: string = 'main'
): Promise<string> => {
  if (!token || !owner || !repo) {
    throw new Error("Configuração do GitHub incompleta. Verifique o Token, Usuário e Repositório.");
  }

  try {
    let content: string;
    let fileName: string;

    if (typeof file === 'string') {
      content = file.split(',')[1] || file;
      fileName = `image_${Date.now()}.jpg`;
    } else {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
      });
      reader.readAsDataURL(file);
      content = await base64Promise;
      fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    }

    const path = `uploads/${fileName}`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Upload image: ${fileName}`,
        content: content,
        branch: branch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha no upload para o GitHub');
    }

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  } catch (error) {
    console.error('GitHub Upload Error:', error);
    throw error;
  }
};
