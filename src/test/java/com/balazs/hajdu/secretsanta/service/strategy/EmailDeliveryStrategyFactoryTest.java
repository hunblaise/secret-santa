package com.balazs.hajdu.secretsanta.service.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailDeliveryStrategyFactoryTest {

    @Mock
    private SynchronousEmailDeliveryStrategy synchronousStrategy;
    
    @Mock
    private AsynchronousEmailDeliveryStrategy asynchronousStrategy;
    
    private EmailDeliveryStrategyFactory factory;
    
    @BeforeEach
    void setUp() {
        factory = new EmailDeliveryStrategyFactory(synchronousStrategy, asynchronousStrategy);
        
        // Set default delivery mode
        ReflectionTestUtils.setField(factory, "defaultDeliveryMode", "sync");
    }
    
    @Test
    void shouldReturnSynchronousStrategyByDefault() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy();
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForSyncMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("sync");
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForSynchronousMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("synchronous");
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnAsynchronousStrategyForAsyncMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("async");
        
        // then
        assertSame(asynchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnAsynchronousStrategyForAsynchronousMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("asynchronous");
        
        // then
        assertSame(asynchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForUnknownMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("unknown");
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForNullMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy(null);
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForEmptyMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("");
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldReturnSynchronousStrategyForWhitespaceMode() {
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy("   ");
        
        // then
        assertSame(synchronousStrategy, strategy);
    }
    
    @Test
    void shouldBeCaseInsensitive() {
        // when
        EmailDeliveryStrategy asyncStrategy1 = factory.getStrategy("ASYNC");
        EmailDeliveryStrategy asyncStrategy2 = factory.getStrategy("AsynC");
        EmailDeliveryStrategy syncStrategy1 = factory.getStrategy("SYNC");
        EmailDeliveryStrategy syncStrategy2 = factory.getStrategy("SynC");
        
        // then
        assertSame(asynchronousStrategy, asyncStrategy1);
        assertSame(asynchronousStrategy, asyncStrategy2);
        assertSame(synchronousStrategy, syncStrategy1);
        assertSame(synchronousStrategy, syncStrategy2);
    }
    
    @Test
    void shouldSupportDeliveryModeChecking() {
        // when & then
        assertTrue(factory.isDeliveryModeSupported("sync"));
        assertTrue(factory.isDeliveryModeSupported("synchronous"));
        assertTrue(factory.isDeliveryModeSupported("async"));
        assertTrue(factory.isDeliveryModeSupported("asynchronous"));
        assertTrue(factory.isDeliveryModeSupported("SYNC"));
        assertTrue(factory.isDeliveryModeSupported("ASYNC"));
        assertTrue(factory.isDeliveryModeSupported(null)); // Default is supported
        assertTrue(factory.isDeliveryModeSupported(""));   // Default is supported
        
        assertFalse(factory.isDeliveryModeSupported("unknown"));
        assertFalse(factory.isDeliveryModeSupported("invalid"));
    }
    
    @Test
    void shouldReturnDefaultDeliveryMode() {
        // when
        String defaultMode = factory.getDefaultDeliveryMode();
        
        // then
        assertEquals("sync", defaultMode);
    }
    
    @Test
    void shouldUseConfiguredDefaultDeliveryMode() {
        // given
        ReflectionTestUtils.setField(factory, "defaultDeliveryMode", "async");
        
        // when
        EmailDeliveryStrategy strategy = factory.getStrategy();
        
        // then
        assertSame(asynchronousStrategy, strategy);
    }
}