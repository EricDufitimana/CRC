"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUpload } from "../../../zenith/src/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Camera } from "lucide-react"
import { useAvatarFetch } from "@/hooks/useAvatarFetch"

export default function HomePage() {
  // Avatar editing states
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [selectedAvatarPath, setSelectedAvatarPath] = useState<string | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<string>('statColors-4')
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File[]>([])
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // Avatar fetching hook
  const { 
    avatars: fetchedAvatars, 
    isLoading: isLoadingAvatars, 
    error: avatarError,
    fetchAvatars 
  } = useAvatarFetch()

  // Fetch avatars on component mount
  useEffect(() => {
    fetchAvatars()
  }, [fetchAvatars])

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <Camera className="h-5 w-5" />
            Edit Profile Picture
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className={`h-28 w-28 ring-4 ring-white/30 shadow-2xl bg-${selectedBackground}`}>
                    <AvatarImage src={selectedAvatar || '/images/avatars/avatar-001.png'} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white">
                      U
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'upload'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upload New
                  </button>
                  <button
                    onClick={() => setActiveTab('existing')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === 'existing'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Choose Avatar
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="min-h-[200px]">
                {activeTab === 'upload' ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Upload your own profile picture</p>
                      <FileUpload
                        multiple={false}
                        accept="image/*"
                        value={uploadedAvatarFile}
                        onChange={(files: File[] | undefined) => {
                          setUploadedAvatarFile(files || []);
                          if (files && files.length > 0) {
                            const url = URL.createObjectURL(files[0]);
                            setSelectedAvatar(url);
                          }
                        }}
                        placeholder="Drop your photo here or click to upload"
                        helperText="JPEG, PNG, GIF, WebP up to 2MB"
                        className="max-w-md mx-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isLoadingAvatars ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="ml-3 text-sm text-gray-600">Loading avatars...</span>
                      </div>
                    ) : avatarError ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-red-500 text-2xl">⚠️</span>
                        </div>
                        <p className="text-sm text-red-600 text-center">Failed to load avatars</p>
                        <p className="text-xs text-gray-400 text-center mt-1">{avatarError}</p>
                        <button 
                          onClick={fetchAvatars}
                          className="mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    ) : fetchedAvatars.length === 0 ? (
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 text-center">No avatars available</p>
                        <p className="text-xs text-gray-400 text-center mt-1">Try uploading your own image instead</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Side-by-side Avatar and Background Selection */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {/* Avatar Selection Column */}
                       <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 text-center">Choose Avatar</h4>
                            
                            {/* Show folder organization if we have many avatars */}
                            {fetchedAvatars.length > 8 && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500">
                                  {fetchedAvatars.length} available avatars
                                </p>
                              </div>
                            )}
                            
                            {/* Avatar Grid - Bigger */}
                            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                              {fetchedAvatars.map((avatar) => (
                                <button
                                  key={avatar.id}
                                  onClick={() => {
                                    const filePath = 'filePath' in avatar && avatar.filePath ? avatar.filePath : `default/${avatar.folder}/${avatar.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                                    console.log('🖼️ Setup: Avatar selected:', { 
                                      id: avatar.id, 
                                      src: avatar.src, 
                                      name: avatar.name,
                                      folder: avatar.folder,
                                      filePath: filePath
                                    });
                                    setSelectedAvatar(avatar.src); // For display
                                    setSelectedAvatarPath(filePath); // For storage
                                  }}
                                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                                    selectedAvatar === avatar.src
                                      ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                      : 'hover:ring-2 hover:ring-gray-300 hover:shadow-md'
                                  }`}
                                >
                                  <Avatar className="h-full w-full">
                                    <AvatarImage 
                                      src={avatar.src} 
                                      alt={avatar.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium">
                                      {avatar.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  {/* Selection indicator */}
                                  {selectedAvatar === avatar.src && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Folder indicator for organization */}
                                  {avatar.folder && (
                                    <div className="absolute top-0.5 left-0.5 bg-white/80 backdrop-blur-sm rounded-full px-1 py-0.5">
                                      <span className="text-xs font-medium text-gray-600">
                                        {avatar.folder}
                                      </span>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>


                          {/* Background Selection Column */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 text-center">Choose Background</h4>
                            <div className="flex justify-center">
                              <div className="grid grid-cols-4 gap-2 max-w-xs">
                                {['statColors-1', 'statColors-2', 'statColors-3', 'statColors-4', 'statColors-5', 'statColors-6', 'statColors-7'].map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setSelectedBackground(color)}
                                    className={`w-8 h-8 rounded-full border-3 transition-all duration-200 hover:scale-110 ${
                                      selectedBackground === color ? 'border-gray-900 ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300 hover:border-gray-400'
                                    } bg-${color}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-4">
          <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedAvatarFile([]);
                    setActiveTab('upload');
                    setSelectedAvatar(null);
                  }}
                  disabled={isUploadingAvatar}
                >
                  Cancel
          </Button>
                
                {/* Apply Changes Button */}
                {((activeTab === 'upload' && uploadedAvatarFile.length > 0) || (activeTab === 'existing' && selectedAvatar)) && (
                  <Button
                    onClick={() => {
                      console.log('🎯 Apply Changes clicked', {
                        activeTab,
                        selectedAvatar,
                        selectedAvatarPath,
                        selectedBackground,
                        uploadedAvatarFile: uploadedAvatarFile.length
                      });
                      // Here you can add your update logic
                      alert('Avatar update functionality would go here!');
                    }}
                    disabled={isUploadingAvatar}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </div>
                    ) : (
                      'Apply Changes'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
