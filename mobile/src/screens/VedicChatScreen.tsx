import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Flame,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Volume2,
  Share2,
  RotateCcw,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { THEME } from '../constants/theme';
import { queryVedicAi, queryVedicAiAsync, VedicAiResponse } from '../services/vedicAiService';
import { useContact } from '../hooks/useContact';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { AppHeader, HeaderIconButton } from '../components/common/AppHeader';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'acharya';
  text: string;
  timestamp: string;
  sanskritVerse?: string;
  shastraRef?: string;
  remedy?: string;
  action?: {
    type: 'puja' | 'store' | 'whatsapp' | 'kundli';
    title: string;
    targetId?: string;
  };
  followUps?: string[];
}

interface VedicChatScreenProps {
  onBackPress?: () => void;
  onNavigateTab?: (tab: string) => void;
  onSelectPujaById?: (pujaId: string) => void;
}

const QUICK_PROMPTS = [
  'धनतेरस कब है और क्या खरीदें?',
  'दीपावली लक्ष्मी पूजन शुभ मुहूर्त',
  'आज का शुभ अभिजीत मुहूर्त कब है?',
  'गृह प्रवेश की सही वैदिक विधि',
  'कालसर्प दोष के लक्षण व सरल उपाय',
  '5-मुखी रुद्राक्ष कैसे धारण करें?',
];

export const VedicChatScreen: React.FC<VedicChatScreenProps> = ({
  onBackPress,
  onNavigateTab,
  onSelectPujaById,
}) => {
  const { user } = useAuth();
  const contact = useContact();
  const [chatMode, setChatMode] = useState<'ai' | 'acharya'>('ai');
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string>(
    () => `VR-DEVOTEE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const { inset } = useKeyboardInset();

  useEffect(() => {
    if (inset > 0) {
      const t = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [inset]);

  const initialGreeting = user?.name
    ? `हरि ॐ ${user.name} जी! मैं VedRit का वेदऋषि AI हूँ। आप आगामी त्योहार (धनतेरस, दीपावली, छठ), शुभ मुहूर्त, जन्म-कुंडली दोष, अथवा पूजा विधि के संबंध में कोई भी जिज्ञासा पूछ सकते हैं।`
    : 'हरि ॐ! मैं VedRit का वेदऋषि AI हूँ। आप आगामी त्योहार (धनतेरस, दीपावली, छठ), शुभ मुहूर्त, जन्म-कुंडली दोष, अथवा पूजा विधि के संबंध में कोई भी जिज्ञासा पूछ सकते हैं।';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: initialGreeting,
      timestamp: 'Just now',
      shastraRef: 'ऋग्वेद एवं भविष्य पुराण',
      sanskritVerse: 'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः॥',
      followUps: [
        'धनतेरस कब है और क्या खरीदें?',
        'दीपावली लक्ष्मी पूजा मुहूर्त क्या है?',
        'आज का अभिजीत मुहूर्त क्या है?',
      ],
    },
  ]);

  const handleResetSession = () => {
    Alert.alert(
      'नई जिज्ञासा आरंभ करें?',
      'क्या आप पूर्व परामर्श को पूर्ण कर नई जिज्ञासा आरंभ करना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'नई जिज्ञासा',
          onPress: () => {
            const newId = `VR-DEVOTEE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
            setSessionId(newId);
            setMessages([
              {
                id: Date.now().toString(),
                sender: 'ai',
                text: initialGreeting,
                timestamp: 'Just now',
                shastraRef: 'ऋग्वेद एवं भविष्य पुराण',
                sanskritVerse: 'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः॥',
                followUps: [
                  'धनतेरस कब है और क्या खरीदें?',
                  'दीपावली लक्ष्मी पूजा मुहूर्त क्या है?',
                  'आज का अभिजीत मुहूर्त क्या है?',
                ],
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    if (chatMode === 'acharya') {
      setTimeout(() => {
        setIsThinking(false);
        const acharyaReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'acharya',
          text: `प्रणाम यजमान ${user?.name || ''}! आपकी जिज्ञासा *" ${query} "* हमारे पूज्य आचार्य जी को WhatsApp Business पर प्रेषित कर दी गई है। आप नीचे दिए गए बटन से सीधे WhatsApp पर वार्ता जारी रख सकते हैं।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: {
            type: 'whatsapp',
            title: 'Continue on WhatsApp Business →',
          },
        };
        setMessages((prev) => [...prev, acharyaReply]);
      }, 900);
      return;
    }

    (async () => {
      try {
        const devoteeContext = {
          name: user?.name,
          gotra: user?.gotra,
          city: user?.city,
          rashi: 'Mesh (Aries)',
        };

        const aiResponse = await queryVedicAiAsync(query, sessionId, devoteeContext);
        setIsThinking(false);

        if (aiResponse.sessionId && aiResponse.sessionId !== sessionId) {
          setSessionId(aiResponse.sessionId);
        }

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponse.answer,
          sanskritVerse: aiResponse.sanskritVerse,
          shastraRef: aiResponse.shastraReference,
          remedy: aiResponse.remedy,
          action: aiResponse.suggestedAction,
          followUps: aiResponse.followUpQuestions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        setIsThinking(false);
        const fallback = queryVedicAi(query);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallback.answer,
          sanskritVerse: fallback.sanskritVerse,
          shastraRef: fallback.shastraReference,
          remedy: fallback.remedy,
          action: fallback.suggestedAction,
          followUps: fallback.followUpQuestions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    })();
  };

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return;
    if (action.type === 'whatsapp') {
      contact.chat('Pranam Pandit Ji, I need guidance.');
    } else if (action.type === 'puja' && onNavigateTab) {
      if (action.targetId && onSelectPujaById) {
        onSelectPujaById(action.targetId);
      }
      onNavigateTab('pujas');
    } else if (action.type === 'store' && onNavigateTab) {
      onNavigateTab('store');
    } else if (action.type === 'kundli' && onNavigateTab) {
      onNavigateTab('kundli');
    }
  };

  const handleAudioBlessing = (sanskritVerse?: string, shastraRef?: string) => {
    if (!sanskritVerse) return;
    Alert.alert(
      'पवित्र वेद मंत्र उच्चारण 🕉️',
      `${sanskritVerse}\n\n📜 शास्त्र प्रमाण: ${shastraRef || 'वेद संहिता'}\n\nयह मंत्र सकारात्मक ऊर्जा, आत्मिक शांति एवं सर्वकल्याणकारी सिद्धि प्रदान करता है। इसका प्रातःकाल 11 बार स्मरण शुभ फलदायी है।`,
      [{ text: 'हरि ॐ तत्सत्' }]
    );
  };

  const handleShareMessage = async (msg: ChatMessage) => {
    try {
      let shareContent = `🕉️ VedRit - वैदिक ज्योतिष व परामर्श 🕉️\n\n${msg.text}`;
      if (msg.sanskritVerse) {
        shareContent += `\n\n📜 श्लोक: ${msg.sanskritVerse}`;
      }
      if (msg.remedy) {
        shareContent += `\n\n🌿 शास्त्रोक्त उपाय:\n${msg.remedy}`;
      }
      shareContent += `\n\nवेदरीति ऐप से प्राप्त प्रामाणिक परामर्श।`;

      await Share.share({
        message: shareContent,
        title: 'वेदरीति वैदिक परामर्श',
      });
    } catch (e) {
    }
  };

  return (
    <AppBackground variant="golden">
      <View style={[styles.container, { paddingBottom: inset }]}>
        <AppHeader
          title="Vedic AI"
          showBack={Boolean(onBackPress)}
          onBackPress={onBackPress}
          rightActions={
            <>
              <HeaderIconButton onPress={handleResetSession} label="New consultation">
                <RotateCcw size={17} color={THEME.colors.heading} />
              </HeaderIconButton>
              <HeaderIconButton onPress={() => contact.chat('Pranam Pandit Ji, I have a question.')} label="Message Pandit Ji on WhatsApp">
                <MessageCircle size={18} color="#15803D" />
              </HeaderIconButton>
            </>
          }
        />

        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            onPress={() => setChatMode('ai')}
            style={[styles.modeTab, chatMode === 'ai' && styles.modeTabActive]}
            activeOpacity={0.85}
          >
            <Sparkles size={11} color={chatMode === 'ai' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.modeTabText, chatMode === 'ai' && styles.modeTabTextActive]}>
              दिव्य ऋषि AI (Instant)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setChatMode('acharya')}
            style={[styles.modeTab, chatMode === 'acharya' && styles.modeTabActive]}
            activeOpacity={0.85}
          >
            <MessageCircle size={11} color={chatMode === 'acharya' ? '#FFF' : '#7E7266'} />
            <Text style={[styles.modeTabText, chatMode === 'acharya' && styles.modeTabTextActive]}>
              आचार्य जी (WhatsApp Live)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickPromptSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptScroll}
          >
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSend(prompt)}
                activeOpacity={0.8}
                style={styles.promptChip}
              >
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowAi,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.aiBubbleTopRow}>
                      {msg.shastraRef ? (
                        <View style={styles.shastraPill}>
                          <BookOpen size={9} color="#996515" />
                          <Text style={styles.shastraPillText}>{msg.shastraRef}</Text>
                        </View>
                      ) : <View />}

                      <View style={styles.msgToolsRow}>
                        {msg.sanskritVerse && (
                          <TouchableOpacity
                            onPress={() => handleAudioBlessing(msg.sanskritVerse, msg.shastraRef)}
                            style={styles.toolIconBtn}
                          >
                            <Volume2 size={13} color="#C65D24" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleShareMessage(msg)}
                          style={styles.toolIconBtn}
                        >
                          <Share2 size={12} color="#7E7266" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {!isUser && msg.sanskritVerse && (
                    <View style={styles.sanskritVerseCard}>
                      <Text style={styles.sanskritVerseText}>{msg.sanskritVerse}</Text>
                    </View>
                  )}

                  <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                    {msg.text}
                  </Text>

                  {!isUser && msg.remedy && (
                    <View style={styles.remedyBox}>
                      <Text style={styles.remedyHeading}>🌿 शास्त्रसम्मत सरल उपाय:</Text>
                      <Text style={styles.remedyBody}>{msg.remedy}</Text>
                    </View>
                  )}

                  {!isUser && msg.action && msg.action.title && (
                    <TouchableOpacity
                      onPress={() => handleActionClick(msg.action)}
                      activeOpacity={0.88}
                      style={styles.actionBtn}
                    >
                      <View style={styles.actionBtnSurface}>
                        <Text style={styles.actionBtnText}>{msg.action.title}</Text>
                        <ArrowRight size={12} color="#FFF" style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>
                  )}

                  <Text
                    style={[
                      styles.timestamp,
                      isUser ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>

                {!isUser && msg.followUps && msg.followUps.length > 0 && (
                  <View style={styles.followUpsContainer}>
                    {msg.followUps.map((fu, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleSend(fu)}
                        activeOpacity={0.8}
                        style={styles.followUpBtn}
                      >
                        <Text style={styles.followUpText}>• {fu}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {isThinking && (
            <View style={styles.thinkingRow}>
              <View style={styles.thinkingBubble}>
                <Sparkles size={13} color="#C65D24" />
                <Text style={styles.thinkingText}>
                  वेदऋषि AI शास्त्र व पंचांग का मंथन कर रहे हैं... ✨
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBarWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                chatMode === 'ai'
                  ? 'वैदिक प्रश्न, त्योहार, मुहूर्त या मंत्र पूछें...'
                  : 'आचार्य जी को WhatsApp संदेश लिखें...'
              }
              placeholderTextColor="#A89E94"
              style={styles.textInput}
              multiline
              maxLength={400}
            />

            <TouchableOpacity
              onPress={() => handleSend()}
              activeOpacity={0.85}
              style={[
                styles.sendBtn,
                inputText.trim().length > 0 ? styles.sendBtnActive : styles.sendBtnDisabled,
              ]}
              disabled={inputText.trim().length === 0}
            >
              <Send size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DD',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
  },
  rishiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  botTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botName: {
    fontFamily: THEME.typography.serif,
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.headingDeep,
    marginRight: 5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 2,
  },
  botStatus: {
    fontSize: 9.5,
    color: THEME.colors.mutedText,
    marginTop: 1,
  },
  iconHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  waHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  waHeaderText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 4,
  },
  modeToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FAF7F2',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginHorizontal: 3,
  },
  modeTabActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  modeTabText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7E7266',
    marginLeft: 5,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  quickPromptSection: {
    paddingVertical: 4,
    backgroundColor: '#FAF7F2',
  },
  promptScroll: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  promptChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginRight: 6,
  },
  promptChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: THEME.colors.headingDeep,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  messageRow: {
    marginVertical: 5,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowAi: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#F8DEC8',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderBottomLeftRadius: 4,
  },
  aiBubbleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shastraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  shastraPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },
  msgToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIconBtn: {
    padding: 3,
    marginLeft: 6,
  },
  sanskritVerseCard: {
    backgroundColor: '#FFFDF9',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1E3D3',
    marginBottom: 8,
  },
  sanskritVerseText: {
    fontFamily: THEME.typography.serif,
    fontSize: 12,
    lineHeight: 18,
    color: '#854D0E',
    fontWeight: '700',
    textAlign: 'center',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userText: {
    color: THEME.colors.headingDeep,
    fontWeight: '600',
  },
  aiText: {
    color: '#2C1810',
    lineHeight: 18.5,
  },
  remedyBox: {
    backgroundColor: '#FBF8F3',
    padding: 9,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#C65D24',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginTop: 8,
  },
  remedyHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C65D24',
    marginBottom: 2,
  },
  remedyBody: {
    fontSize: 11,
    lineHeight: 15.5,
    color: THEME.colors.headingDeep,
  },
  actionBtn: {
    marginTop: 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtnSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C65D24',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 8.5,
    marginTop: 5,
  },
  userTimestamp: {
    color: '#A08070',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#A0988E',
    textAlign: 'left',
  },
  followUpsContainer: {
    marginTop: 5,
    maxWidth: '92%',
  },
  followUpBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginTop: 3,
  },
  followUpText: {
    fontSize: 10,
    color: '#C65D24',
    fontWeight: '700',
  },
  thinkingRow: {
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  thinkingText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.headingDeep,
    marginLeft: 6,
  },
  inputBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7DD',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 12 : 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 90,
    fontSize: 12,
    color: THEME.colors.headingDeep,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendBtnActive: {
    backgroundColor: '#C65D24',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1C7BB',
  },
});
